package com.example.ecomerce_backend.service.ai;

import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.dto.response.ProductSummaryResponse;
import com.example.ecomerce_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

/**
 * AI Tools cho tra cứu và xem danh sách sản phẩm.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductTools {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("price", "name", "createdAt");
    private static final int MAX_PAGE = 1000;
    private static final int MAX_SIZE = 50;
    private static final int DEFAULT_SIZE = 12;

    private final ProductService productService;

    @Tool(description = "Xem danh sách sản phẩm của cửa hàng hoặc tìm kiếm sản phẩm theo điều kiện. "
            + "Trả về danh sách sản phẩm kèm id, tên, giá gốc (price), giá flash sale nếu đang giảm giá (flashSalePrice), tồn kho, danh mục. "
            + "Nếu sản phẩm có flashSalePrice (khác null và nhỏ hơn price), sản phẩm đó đang được giảm giá trong chương trình Flash Sale: hãy hiển thị cho khách hàng cả giá gốc và giá khuyến mãi (Flash Sale). "
            + "Dùng khi khách hàng muốn xem danh sách sản phẩm, hỏi cửa hàng bán những mặt hàng gì, "
            + "hoặc tìm kiếm sản phẩm theo tên, danh mục, khoảng giá. "
            + "Để xem tất cả sản phẩm, để trống keyword. "
            + "Keyword không cần dấu tiếng Việt.")
    public PageResponse<ProductSummaryResponse> getProducts(
            @ToolParam(description = "Từ khóa tìm kiếm trong tên sản phẩm (để trống nếu muốn xem tất cả sản phẩm). Không cần dấu tiếng Việt.") String keyword,
            @ToolParam(description = "ID danh mục để lọc theo danh mục (có thể để trống)") Long categoryId,
            @ToolParam(description = "Giá tối thiểu để lọc (có thể để trống)") BigDecimal minPrice,
            @ToolParam(description = "Giá tối đa để lọc (có thể để trống)") BigDecimal maxPrice,
            @ToolParam(description = "Trường sắp xếp: price, name, createdAt (mặc định createdAt)") String sortBy,
            @ToolParam(description = "Hướng sắp xếp: asc hoặc desc (mặc định desc)") String sortDir,
            @ToolParam(description = "Trang (bắt đầu từ 0, mặc định 0)") Integer page,
            @ToolParam(description = "Số sản phẩm mỗi trang (mặc định 12, tối đa 50)") Integer size
    ) {
        // 1. Chuẩn hóa keyword
        String safeKeyword = keyword;
        if (safeKeyword != null) {
            safeKeyword = safeKeyword.trim();
            if (safeKeyword.isEmpty()) {
                safeKeyword = null;
            } else if (safeKeyword.length() > 200) {
                safeKeyword = safeKeyword.substring(0, 200);
            }
        }

        // 2. Chuẩn hóa categoryId: <= 0 là không hợp lệ, chuyển thành null
        Long safeCategoryId = (categoryId != null && categoryId > 0) ? categoryId : null;

        // 3. Chuẩn hóa phân trang: page >= 0, size trong [1, 50]
        int safePage = (page == null || page < 0) ? 0 : Math.min(page, MAX_PAGE);
        int safeSize = (size == null || size <= 0) ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);

        // 4. Chuẩn hóa khoảng giá
        BigDecimal safeMin = minPrice;
        BigDecimal safeMax = maxPrice;
        if (safeMin != null && safeMin.compareTo(BigDecimal.ZERO) < 0) {
            safeMin = BigDecimal.ZERO;
        }
        if (safeMax != null && safeMax.compareTo(BigDecimal.ZERO) < 0) {
            safeMax = null;
        }
        if (safeMin != null && safeMax != null && safeMin.compareTo(safeMax) > 0) {
            BigDecimal temp = safeMin;
            safeMin = safeMax;
            safeMax = temp;
        }

        // 5. Chuẩn hóa sắp xếp: chỉ chấp nhận price, name, createdAt
        String safeSortBy = (sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy.trim()))
                ? sortBy.trim()
                : "createdAt";
        String safeSortDir = "asc".equalsIgnoreCase(sortDir != null ? sortDir.trim() : null) ? "asc" : "desc";

        try {
            return productService.search(
                    safeKeyword,
                    safeCategoryId,
                    safeMin,
                    safeMax,
                    safeSortBy,
                    safeSortDir,
                    safePage,
                    safeSize
            );
        } catch (Exception e) {
            log.error("Lỗi khi xem danh sách sản phẩm: {}", e.getMessage(), e);
            return new PageResponse<>(Collections.emptyList(), safePage, safeSize, 0L, 0);
        }
    }

    @Tool(description = "Tìm kiếm sản phẩm theo từ khóa trong tên sản phẩm hoặc lấy danh sách tất cả sản phẩm. "
            + "Trả về danh sách sản phẩm kèm giá gốc (price), giá flash sale nếu đang giảm giá (flashSalePrice), tồn kho, danh mục. "
            + "Nếu sản phẩm có flashSalePrice, hãy luôn hiển thị cả giá gốc và giá khuyến mãi Flash Sale cho khách hàng. "
            + "Dùng khi khách hàng hỏi về sản phẩm cụ thể hoặc tìm kiếm theo từ khóa.")
    public PageResponse<ProductSummaryResponse> searchProducts(
            @ToolParam(description = "Từ khóa tìm kiếm trong tên sản phẩm (để trống nếu muốn lấy tất cả). Không cần dấu tiếng Việt.") String keyword,
            @ToolParam(description = "ID danh mục để lọc theo danh mục (có thể để trống)") Long categoryId,
            @ToolParam(description = "Giá tối thiểu để lọc (có thể để trống)") BigDecimal minPrice,
            @ToolParam(description = "Giá tối đa để lọc (có thể để trống)") BigDecimal maxPrice,
            @ToolParam(description = "Trường sắp xếp: price, name, createdAt (mặc định createdAt)") String sortBy,
            @ToolParam(description = "Hướng sắp xếp: asc hoặc desc (mặc định desc)") String sortDir,
            @ToolParam(description = "Trang (bắt đầu từ 0, mặc định 0)") Integer page,
            @ToolParam(description = "Số sản phẩm mỗi trang (mặc định 12, tối đa 50)") Integer size
    ) {
        return getProducts(keyword, categoryId, minPrice, maxPrice, sortBy, sortDir, page, size);
    }

    @Tool(description = "Lấy chi tiết sản phẩm theo ID. "
            + "Trả về thông tin đầy đủ: tên, mô tả, giá gốc (price), giá flash sale nếu đang giảm giá (flashSalePrice), danh mục, ảnh, tồn kho, thời gian tạo/cập nhật. "
            + "Nếu sản phẩm có flashSalePrice, hãy báo cho khách hàng cả giá gốc và giá khuyến mãi Flash Sale. "
            + "Dùng khi khách hàng muốn xem chi tiết một sản phẩm cụ thể theo ID.")
    public Object getProductById(
            @ToolParam(description = "ID của sản phẩm cần xem chi tiết (số nguyên dương)") Long productId
    ) {
        if (productId == null || productId <= 0) {
            return Map.of("found", false, "message", "ID sản phẩm không hợp lệ (phải là số nguyên dương)");
        }
        try {
            return productService.getById(productId);
        } catch (ResourceNotFoundException e) {
            return Map.of("found", false, "message", "Không tìm thấy sản phẩm có ID: " + productId);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết sản phẩm {}: {}", productId, e.getMessage(), e);
            return Map.of("found", false, "message", "Không thể lấy thông tin sản phẩm: " + e.getMessage());
        }
    }
}
