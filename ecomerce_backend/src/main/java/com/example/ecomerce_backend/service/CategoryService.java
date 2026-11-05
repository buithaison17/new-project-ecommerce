package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.ResourceExistedException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CategoryRequest;
import com.example.ecomerce_backend.model.dto.response.CategoryResponse;
import com.example.ecomerce_backend.model.entity.Category;
import com.example.ecomerce_backend.model.mapper.CatalogMapper;
import com.example.ecomerce_backend.repository.CategoryRepository;
import com.example.ecomerce_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CatalogMapper mapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAllActive().stream().map(mapper::toCategoryResponse).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.existsActiveByName(name)) {
            throw new ResourceExistedException("Danh mục đã tồn tại");
        }
        Category category = categoryRepository.save(Category.builder()
                .name(name)
                .description(request.description())
                .build());
        log.info("Tạo danh mục id={} name={}", category.getId(), category.getName());
        return mapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findActive(id);
        String name = request.name().trim();
        if (categoryRepository.existsActiveByNameAndIdNot(name, id)) {
            throw new ResourceExistedException("Danh mục đã tồn tại");
        }
        category.setName(name);
        category.setDescription(request.description());
        log.info("Cập nhật danh mục id={}", id);
        return mapper.toCategoryResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findActive(id);
        if (productRepository.existsActiveByCategoryId(id)) {
            throw new BadRequestException("Không thể xóa danh mục đang có sản phẩm");
        }
        category.setIsDeleted(true);
        log.info("Xóa (mềm) danh mục id={}", id);
    }

    Category findActive(Long id) {
        return categoryRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục id=" + id));
    }
}