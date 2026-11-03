package com.example.ecomerce_backend.model.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserDeliveryRequest(
        @NotBlank(message = "Địa đỉa không được để trống")
        String address,
        @NotBlank(message = "Số điện thoại không được để trống")
        @Size(min = 10, max = 10, message = "Số điện thoại phải có 10 số")
        String phoneNumber
) {
}
