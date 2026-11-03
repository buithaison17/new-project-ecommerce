package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        /** Tổng số lượng sản phẩm (cộng quantity của mọi dòng). */
        Integer totalQuantity,
        BigDecimal totalAmount
) {
}