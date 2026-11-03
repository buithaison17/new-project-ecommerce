package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull(message = "Sản phẩm không được để trống")
        Long productId,
        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        @Max(value = 999, message = "Số lượng tối đa 999")
        Integer quantity
) {
}