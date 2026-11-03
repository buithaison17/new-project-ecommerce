package com.example.ecomerce_backend.model.dto.request;

import com.example.ecomerce_backend.constants.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record OrderUpdateStatusRequest(
        @NotNull(message = "Trạng thái không được để trống")
        OrderStatus status
) {
}
