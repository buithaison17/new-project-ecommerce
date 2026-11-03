package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateOrderItemRequest(
        @NotNull(message = "ID sản phẩm không được để trống")
        Long productId,
        @NotNull(message = "Số lượng không được để trống")
        @Positive(message = "Số lượng sản phẩm phải lớn hơn 0")
        Integer quantity
) {
}
