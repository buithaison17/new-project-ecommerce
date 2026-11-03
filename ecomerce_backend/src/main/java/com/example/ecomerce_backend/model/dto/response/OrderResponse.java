package com.example.ecomerce_backend.model.dto.response;

import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
        Long id,
        UserInformationResponse user,
        BigDecimal totalAmount,
        BigDecimal shippingAmount,
        BigDecimal finalAmount,
        UserDeliveryResponse delivery,
        String orderStatus,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        String note
) {
}
