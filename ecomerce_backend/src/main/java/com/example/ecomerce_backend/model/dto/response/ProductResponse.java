package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/** Dùng cho trang chi tiết sản phẩm và kết quả của các API admin & AI tool. */
public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        CategoryResponse category,
        String thumbnailUrl,
        List<ProductImageResponse> images,
        Integer stockQuantity,
        Boolean inStock,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        BigDecimal flashSalePrice
) {
    public ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            CategoryResponse category,
            String thumbnailUrl,
            List<ProductImageResponse> images,
            Integer stockQuantity,
            Boolean inStock,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this(id, name, description, price, category, thumbnailUrl, images, stockQuantity, inStock, createdAt, updatedAt, null);
    }

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
