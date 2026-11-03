package com.example.ecomerce_backend.model.dto.response;

import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

public record CreateCheckoutResponse(
        Long orderId,
        Long orderCode,
        String checkoutUrl,
        String paymentLinkId,
        PaymentLinkStatus status,
        String qrCode
) {
}
