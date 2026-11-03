package com.example.ecomerce_backend.model.dto.request;

import com.example.ecomerce_backend.constants.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Trạng thái mới không được để trống")
        OrderStatus status
) {
}