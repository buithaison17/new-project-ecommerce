package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.CategoryResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.dto.response.ProductResponse;
import com.example.ecomerce_backend.model.dto.response.ProductSummaryResponse;
import com.example.ecomerce_backend.service.CategoryService;
import com.example.ecomerce_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/** API công khai cho khách hàng (không cần đăng nhập): danh mục, tìm kiếm/lọc, chi tiết sản phẩm. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CatalogController {
    private final ProductService productService;
    private final CategoryService categoryService;

    @GetMapping("/categories")
    public ResponseEntity<ApiDataResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy danh sách danh mục thành công", categoryService.getAll()));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiDataResponse<PageResponse<ProductSummaryResponse>>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy danh sách sản phẩm thành công",
                productService.search(keyword, categoryId, minPrice, maxPrice, sortBy, sortDir, page, size)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiDataResponse<ProductResponse>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy chi tiết sản phẩm thành công", productService.getById(id)));
    }
}