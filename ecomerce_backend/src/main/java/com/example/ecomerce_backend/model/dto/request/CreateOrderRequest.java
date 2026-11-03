package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record CreateOrderRequest(
        @NotNull(message = "Danh sách sản phẩm không được để trống")
        List<CreateOrderItemRequest> items,
        @NotNull(message = "Địa chỉ nhận hàng không được để trống")
        Long deliveryId,
        @NotBlank(message = "Phương thức thanh toán không được để trống")
        @Pattern(regexp = "^(CASH|CREDIT_CARD)$", message = "Phương thức thanh toán không hợp lệ")
        String paymentMethod,
        String note
) {
}
