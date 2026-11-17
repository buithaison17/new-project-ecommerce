package com.example.ecomerce_backend.service.ai;

import com.example.ecomerce_backend.model.dto.response.FlashSaleResponse;
import com.example.ecomerce_backend.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * AI Tools cho tra cứu Flash Sale (chương trình khuyến mãi giảm giá).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FlashSaleTools {

    private final FlashSaleService flashSaleService;

    @Tool(description = "Lấy danh sách các chương trình Flash Sale (khuyến mãi, giảm giá) đang diễn ra. "
            + "Trả về tên chương trình, mô tả, loại giảm giá (PERCENTAGE hoặc FIXED_AMOUNT), giá trị giảm, "
            + "phạm vi áp dụng (CATEGORY, PRODUCT hoặc ALL), thời gian bắt đầu và kết thúc. "
            + "Dùng khi khách hàng hỏi về khuyến mãi, giảm giá, săn sale, flash sale.")
    public List<FlashSaleResponse> getActiveFlashSales() {
        try {
            return flashSaleService.getActive();
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách Flash Sale đang chạy", e);
            return Collections.emptyList();
        }
    }
}
