package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.FlashSaleDiscountType;
import com.example.ecomerce_backend.constants.FlashSaleScope;
import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.FlashSaleRequest;
import com.example.ecomerce_backend.model.dto.response.FlashSaleResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.entity.Category;
import com.example.ecomerce_backend.model.entity.FlashSale;
import com.example.ecomerce_backend.model.entity.Product;
import com.example.ecomerce_backend.repository.FlashSaleRepository;
import com.example.ecomerce_backend.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlashSaleService {
    private static final int MAX_PAGE_SIZE = 100;

    private final FlashSaleRepository flashSaleRepository;
    private final CategoryService categoryService;
    private final ProductRepository productRepository;

    // ------------------------------------------------------------------ Public

    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getActive() {
        LocalDateTime now = LocalDateTime.now();
        return flashSaleRepository.findByIsDeletedFalseAndIsActiveTrueOrderByStartAtAsc().stream()
                .filter(sale -> isRunning(sale, now))
                .map(this::toResponse)
                .toList();
    }

    /**
     * Tính giá bán thực tế của sản phẩm tại thời điểm hiện tại.
     * Nếu có nhiều chương trình Flash Sale cùng áp dụng, lấy mức giá thấp nhất.
     */
    @Transactional(readOnly = true)
    public BigDecimal getEffectivePrice(Product product) {
        return getEffectivePrices(List.of(product)).get(product.getId());
    }

    /**
     * Tính giá bán thực tế cho nhiều sản phẩm, chỉ truy vấn danh sách Flash Sale một lần.
     */
    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> getEffectivePrices(List<Product> products) {
        LocalDateTime now = LocalDateTime.now();
        List<FlashSale> runningSales = flashSaleRepository
                .findByIsDeletedFalseAndIsActiveTrueOrderByStartAtAsc().stream()
                .filter(sale -> isRunning(sale, now))
                .toList();
        Map<Long, BigDecimal> result = new HashMap<>();
        for (Product product : products) {
            BigDecimal price = product.getPrice();
            BigDecimal effective = runningSales.stream()
                    .filter(sale -> appliesTo(sale, product))
                    .map(sale -> applyDiscount(price, sale))
                    .min(BigDecimal::compareTo)
                    .orElse(price);
            result.put(product.getId(), effective);
        }
        return result;
    }

    private boolean appliesTo(FlashSale sale, Product product) {
        return switch (sale.getScope()) {
            case ALL -> true;
            case CATEGORY -> sale.getCategory() != null
                    && product.getCategory() != null
                    && sale.getCategory().getId().equals(product.getCategory().getId());
            case PRODUCT -> sale.getProduct() != null
                    && sale.getProduct().getId().equals(product.getId());
        };
    }

    private BigDecimal applyDiscount(BigDecimal price, FlashSale sale) {
        BigDecimal discounted = switch (sale.getDiscountType()) {
            case PERCENTAGE -> price.multiply(BigDecimal.ONE.subtract(
                    sale.getDiscountValue().divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)));
            case FIXED_AMOUNT -> price.subtract(sale.getDiscountValue());
        };
        if (discounted.signum() < 0) {
            return BigDecimal.ZERO;
        }
        return discounted.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    // ------------------------------------------------------------------ Admin

    @Transactional(readOnly = true)
    public PageResponse<FlashSaleResponse> findAll(String scope, Boolean active, int page, int size) {
        Specification<FlashSale> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.<Boolean>get("isDeleted")));
            if (scope != null && !scope.isBlank()) {
                predicates.add(cb.equal(root.get("scope"), parseScope(scope)));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("isActive"), active));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        PageRequest pageRequest = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.ASC, "id"))
        );
        Page<FlashSale> result = flashSaleRepository.findAll(specification, pageRequest);
        return PageResponse.from(result, this::toResponse);
    }

    @Transactional(readOnly = true)
    public FlashSaleResponse getById(Long id) {
        return toResponse(findActive(id));
    }

    @Transactional
    public FlashSaleResponse create(FlashSaleRequest request) {
        validateRequest(request);
        FlashSale sale = FlashSale.builder()
                .name(request.name().trim())
                .description(request.description())
                .scope(parseScope(request.scope()))
                .discountType(parseDiscountType(request.discountType()))
                .discountValue(request.discountValue())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .isActive(request.isActive() == null || request.isActive())
                .build();
        applyTargets(sale, request);
        sale = flashSaleRepository.save(sale);
        log.info("Tạo Flash Sale id={} name={} scope={}", sale.getId(), sale.getName(), sale.getScope());
        return toResponse(sale);
    }

    @Transactional
    public FlashSaleResponse update(Long id, FlashSaleRequest request) {
        FlashSale sale = findActive(id);
        validateRequest(request);
        sale.setName(request.name().trim());
        sale.setDescription(request.description());
        sale.setScope(parseScope(request.scope()));
        sale.setDiscountType(parseDiscountType(request.discountType()));
        sale.setDiscountValue(request.discountValue());
        sale.setStartAt(request.startAt());
        sale.setEndAt(request.endAt());
        sale.setIsActive(request.isActive() == null ? Boolean.TRUE.equals(sale.getIsActive()) : request.isActive());
        applyTargets(sale, request);
        log.info("Cập nhật Flash Sale id={}", id);
        return toResponse(sale);
    }

    @Transactional
    public void delete(Long id) {
        FlashSale sale = findActive(id);
        sale.setIsDeleted(true);
        log.info("Xóa (mềm) Flash Sale id={}", id);
    }

    // ------------------------------------------------------------------ helpers

    private FlashSale findActive(Long id) {
        return flashSaleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chương trình Flash Sale id=" + id));
    }

    private boolean isRunning(FlashSale sale, LocalDateTime now) {
        return Boolean.TRUE.equals(sale.getIsActive())
                && !Boolean.TRUE.equals(sale.getIsDeleted())
                && !now.isBefore(sale.getStartAt())
                && !now.isAfter(sale.getEndAt());
    }

    private void validateRequest(FlashSaleRequest request) {
        if (!request.startAt().isBefore(request.endAt())) {
            throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }
        FlashSaleDiscountType discountType = parseDiscountType(request.discountType());
        if (discountType == FlashSaleDiscountType.PERCENTAGE
                && request.discountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Giảm theo phần trăm không được vượt quá 100%");
        }
    }

    private void applyTargets(FlashSale sale, FlashSaleRequest request) {
        FlashSaleScope scope = parseScope(request.scope());
        sale.setCategory(null);
        sale.setProduct(null);
        switch (scope) {
            case ALL -> {
                if (request.categoryId() != null || request.productId() != null) {
                    throw new BadRequestException("Chương trình áp dụng toàn cửa hàng không nhận categoryId/productId");
                }
            }
            case CATEGORY -> {
                if (request.productId() != null) {
                    throw new BadRequestException("Chương trình theo danh mục không được chọn productId");
                }
                if (request.categoryId() == null) {
                    throw new BadRequestException("Chương trình theo danh mục phải chọn categoryId");
                }
                Category category = categoryService.findActive(request.categoryId());
                sale.setCategory(category);
            }
            case PRODUCT -> {
                if (request.categoryId() != null) {
                    throw new BadRequestException("Chương trình theo sản phẩm không được chọn categoryId");
                }
                if (request.productId() == null) {
                    throw new BadRequestException("Chương trình theo sản phẩm phải chọn productId");
                }
                Product product = productRepository.findActiveById(request.productId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id=" + request.productId()));
                sale.setProduct(product);
            }
        }
    }

    private FlashSaleScope parseScope(String scope) {
        try {
            return FlashSaleScope.valueOf(scope.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Phạm vi Flash Sale không hợp lệ");
        }
    }

    private FlashSaleDiscountType parseDiscountType(String discountType) {
        try {
            return FlashSaleDiscountType.valueOf(discountType.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Loại giảm giá Flash Sale không hợp lệ");
        }
    }

    private FlashSaleResponse toResponse(FlashSale sale) {
        LocalDateTime now = LocalDateTime.now();
        Category category = sale.getCategory();
        Product product = sale.getProduct();
        return new FlashSaleResponse(
                sale.getId(),
                sale.getName(),
                sale.getDescription(),
                sale.getScope().name(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                product == null ? null : product.getId(),
                product == null ? null : product.getName(),
                sale.getDiscountType().name(),
                sale.getDiscountValue(),
                sale.getStartAt(),
                sale.getEndAt(),
                sale.getIsActive(),
                isRunning(sale, now),
                sale.getCreatedAt(),
                sale.getUpdatedAt()
        );
    }
}
