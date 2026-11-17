package com.example.ecomerce_backend.service.ai;

import com.example.ecomerce_backend.model.dto.response.CategoryResponse;
import com.example.ecomerce_backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * AI tool tra cứu danh mục sản phẩm.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryTools {

    private final CategoryService categoryService;

    @Tool(description = "Lấy danh sách tất cả các danh mục sản phẩm đang hoạt động của cửa hàng. "
            + "Trả về id, tên và mô tả của từng danh mục. "
            + "Dùng khi khách hàng hỏi về các danh mục, ngành hàng, cửa hàng có những loại hàng gì, "
            + "hoặc cần categoryId để lọc sản phẩm.")
    public List<CategoryResponse> getCategories() {
        try {
            return categoryService.getAll();
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh mục sản phẩm", e);
            return Collections.emptyList();
        }
    }
}
