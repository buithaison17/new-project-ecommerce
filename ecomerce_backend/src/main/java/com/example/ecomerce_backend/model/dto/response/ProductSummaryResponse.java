package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

/** Dùng cho danh sách sản phẩm dạng lưới (Product Grid). */
public record ProductSummaryResponse(
        Long id,
        String name,
        BigDecimal price,
        Long categoryId,
        String categoryName,
        String thumbnailUrl,
        Integer stockQuantity,
        Boolean inStock,
        BigDecimal flashSalePrice
) {
    public BigDecimal getOriginalPrice() {
        return price;
    }

    public Boolean getHasFlashSale() {
        return flashSalePrice != null && price != null && flashSalePrice.compareTo(price) < 0;
    }

    public String getPriceDisplay() {
        if (price == null) {
            return "";
        }
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        if (Boolean.TRUE.equals(getHasFlashSale())) {
            return "Giá gốc: " + nf.format(price) + " đ -> Giá Flash Sale: " + nf.format(flashSalePrice) + " đ (Đang giảm giá)";
        }
        return nf.format(price) + " đ";
    }
}
