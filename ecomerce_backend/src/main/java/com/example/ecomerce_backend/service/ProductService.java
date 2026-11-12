package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CreateProductRequest;
import com.example.ecomerce_backend.model.dto.request.UpdateProductRequest;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.dto.response.ProductResponse;
import com.example.ecomerce_backend.model.dto.response.ProductSummaryResponse;
import com.example.ecomerce_backend.model.entity.Category;
import com.example.ecomerce_backend.model.entity.Inventory;
import com.example.ecomerce_backend.model.entity.Product;
import com.example.ecomerce_backend.model.entity.ProductImage;
import com.example.ecomerce_backend.model.mapper.CatalogMapper;
import com.example.ecomerce_backend.repository.InventoryRepository;
import com.example.ecomerce_backend.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> SORTABLE_FIELDS = Set.of("price", "name", "createdAt");
    private static final int MAX_IMAGES_PER_PRODUCT = 10;

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryService categoryService;
    private final FileStorageService fileStorageService;
    private final CatalogMapper mapper;

    // ------------------------------------------------------------ Khách hàng (public)

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> search(
            String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            String sortBy, String sortDir, int page, int size
    ) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Giá tối thiểu không được lớn hơn giá tối đa");
        }
        String sortField = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        // Thêm id làm tiêu chí phụ để phân trang ổn định khi nhiều sản phẩm cùng giá/tên
        Sort sort = Sort.by(direction, sortField).and(Sort.by(Sort.Direction.ASC, "id"));
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, sort);

        Page<Product> result;
        if (keyword != null && !keyword.isBlank()) {
            // Lọc keyword ở tầng Java sau khi bỏ dấu tiếng Việt, để tìm được
            // cả khi người dùng/AI gõ không dấu (vd: "dien thoai" -> "Điện thoại")
            String normalizedKeyword = normalizeVietnamese(keyword);
            List<Product> filtered = productRepository
                    .findAll(buildSpecification(categoryId, minPrice, maxPrice))
                    .stream()
                    .filter(p -> normalizeVietnamese(p.getName()).contains(normalizedKeyword))
                    .sorted(productComparator(sortField, direction))
                    .toList();
            int from = Math.min(safePage * safeSize, filtered.size());
            int to = Math.min(from + safeSize, filtered.size());
            result = new PageImpl<>(filtered.subList(from, to), pageRequest, filtered.size());
        } else {
            result = productRepository.findAll(
                    buildSpecification(categoryId, minPrice, maxPrice), pageRequest);
        }

        // 1 query lấy tồn kho cho cả trang, tránh N+1
        List<Long> ids = result.getContent().stream().map(Product::getId).toList();
        Map<Long, Integer> stockByProduct = ids.isEmpty() ? Map.of()
                : inventoryRepository.findByProductIdIn(ids).stream()
                .collect(Collectors.toMap(i -> i.getProduct().getId(), Inventory::availableQuantity));

        return PageResponse.from(result, product ->
                mapper.toProductSummary(product, Math.max(stockByProduct.getOrDefault(product.getId(), 0), 0)));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toDetail(findActive(id));
    }

    // ------------------------------------------------------------------ Admin

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Category category = categoryService.findActive(request.categoryId());
        Product product = Product.builder()
                .name(request.name().trim())
                .description(request.description())
                .price(request.price())
                .category(category)
                .build();
        if (request.imageUrls() != null) {
            for (String url : request.imageUrls()) {
                product.getProductImages().add(ProductImage.builder().product(product).url(url.trim()).build());
            }
        }
        product = productRepository.save(product);

        int initialQuantity = request.initialQuantity() == null ? 0 : request.initialQuantity();
        inventoryRepository.save(Inventory.builder()
                .product(product)
                .quantity(initialQuantity)
                .reservedQuantity(0)
                .build());
        log.info("Tạo sản phẩm id={} name={} tồn kho ban đầu={}", product.getId(), product.getName(), initialQuantity);
        return mapper.toProductDetail(product, initialQuantity);
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        Product product = findActive(id);
        product.setCategory(categoryService.findActive(request.categoryId()));
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        log.info("Cập nhật sản phẩm id={}", id);
        return toDetail(product);
    }

    /**
     * Ẩn/xóa mềm: sản phẩm biến mất khỏi catalog nhưng đơn hàng cũ vẫn tham chiếu được.
     */
    @Transactional
    public void delete(Long id) {
        Product product = findActive(id);
        product.getProductImages().forEach(image -> fileStorageService.deleteImage(image.getUrl()));
        product.setIsDeleted(true);
        log.info("Xóa (mềm) sản phẩm id={}", id);
    }

    @Transactional
    public ProductResponse addImage(Long productId, MultipartFile file) {
        Product product = findActive(productId);
        long activeImages = product.getProductImages().stream()
                .filter(image -> !Boolean.TRUE.equals(image.getIsDeleted())).count();
        if (activeImages >= MAX_IMAGES_PER_PRODUCT) {
            throw new BadRequestException("Mỗi sản phẩm tối đa " + MAX_IMAGES_PER_PRODUCT + " ảnh");
        }
        String url = fileStorageService.storeImage(file);
        ProductImage image = ProductImage.builder().product(product).url(url).build();
        product.getProductImages().add(image);
        productRepository.saveAndFlush(product); // flush để image có id trước khi map response
        log.info("Thêm ảnh cho sản phẩm id={} url={}", productId, url);
        return toDetail(product);
    }

    @Transactional
    public ProductResponse deleteImage(Long productId, Long imageId) {
        Product product = findActive(productId);
        ProductImage image = product.getProductImages().stream()
                .filter(i -> imageId.equals(i.getId()) && !Boolean.TRUE.equals(i.getIsDeleted()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh id=" + imageId));
        fileStorageService.deleteImage(image.getUrl());
        image.setIsDeleted(true);
        log.info("Xóa ảnh id={} của sản phẩm id={}", imageId, productId);
        return toDetail(product);
    }

    // ------------------------------------------------------------------ helpers

    private Product findActive(Long id) {
        return productRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id=" + id));
    }

    private ProductResponse toDetail(Product product) {
        int stock = inventoryRepository.findByProductId(product.getId())
                .map(Inventory::availableQuantity).orElse(0);
        return mapper.toProductDetail(product, Math.max(stock, 0));
    }

    private Specification<Product> buildSpecification(
            Long categoryId, BigDecimal minPrice, BigDecimal maxPrice
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.<Boolean>get("isDeleted")));
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.<BigDecimal>get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.<BigDecimal>get("price"), maxPrice));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Bỏ dấu tiếng Việt + lowercase để so sánh keyword không phân biệt dấu.
     * "đ/Đ" không phân rã được bằng NFD nên phải thay thủ công.
     */
    private String normalizeVietnamese(String value) {
        if (value == null) {
            return "";
        }
        String noMarks = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return noMarks.replace('đ', 'd').replace('Đ', 'D').toLowerCase();
    }

    private Comparator<Product> productComparator(String sortField, Sort.Direction direction) {
        Comparator<Product> primary = switch (sortField) {
            case "price" -> Comparator.comparing(Product::getPrice, Comparator.nullsLast(Comparator.naturalOrder()));
            case "name" -> Comparator.comparing(Product::getName, Comparator.nullsLast(String::compareToIgnoreCase));
            default -> Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        };
        if (direction == Sort.Direction.DESC) {
            primary = primary.reversed();
        }
        return primary.thenComparing(Product::getId, Comparator.nullsLast(Comparator.naturalOrder()));
    }
}