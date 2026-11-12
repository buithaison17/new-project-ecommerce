package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.model.dto.response.FlashSaleResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.dto.response.ProductSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Các tool mà AI có thể gọi để tra cứu catalog sản phẩm và Flash Sale.
 * Spring AI tự động đăng ký các method có annotation @Tool vào ChatClient.
 */
@Component
@RequiredArgsConstructor
public class CatalogTools {

    private final ProductService productService;
    private final FlashSaleService flashSaleService;

    @Tool(description = "Tìm kiếm sản phẩm theo từ khóa trong tên sản phẩm. "
            + "Trả về danh sách sản phẩm kèm giá, tồn kho, danh mục. "
            + "Dùng khi khách hàng hỏi về sản phẩm, giá cả, hoặc muốn tìm mua. "
            + "Ví dụ: khách hỏi 'tìm sách tâm lý' thì truyền keyword='sách tâm lý' hoặc 'tâm lý'. "
            + "Keyword không cần dấu tiếng Việt, hệ thống sẽ tự động bỏ dấu để so sánh.")
    public PageResponse<ProductSummaryResponse> searchProducts(
            @ToolParam(description = "Từ khóa tìm kiếm trong tên sản phẩm (có thể để trống). "
                    + "Ví dụ: 'sách tâm lý', 'dien thoai', 'laptop'. Không cần dấu tiếng Việt.") String keyword,
            @ToolParam(description = "ID danh mục (có thể để trống)") Long categoryId,
            @ToolParam(description = "Giá tối thiểu (có thể để trống)") BigDecimal minPrice,
            @ToolParam(description = "Giá tối đa (có thể để trống)") BigDecimal maxPrice,
            @ToolParam(description = "Trường sắp xếp: price, name, createdAt (mặc định createdAt)") String sortBy,
            @ToolParam(description = "Hướng sắp xếp: asc hoặc desc (mặc định desc)") String sortDir,
            @ToolParam(description = "Trang (bắt đầu từ 0, mặc định 0)") int page,
            @ToolParam(description = "Số sản phẩm mỗi trang (mặc định 8, tối đa 10)") int size
    ) {
        int safeSize = size <= 0 ? 8 : Math.min(size, 10);
        return productService.search(keyword, categoryId, minPrice, maxPrice,
                sortBy == null ? "createdAt" : sortBy,
                sortDir == null ? "desc" : sortDir,
                page, safeSize);
    }

    @Tool(description = "Lấy danh sách các chương trình Flash Sale đang chạy (giảm giá). "
            + "Trả về tên chương trình, loại giảm giá, phạm vi áp dụng, thời gian bắt đầu/kết thúc. "
            + "Dùng khi khách hàng hỏi về khuyến mãi, giảm giá, Flash Sale.")
    public List<FlashSaleResponse> getActiveFlashSales() {
        return flashSaleService.getActive();
    }
}
