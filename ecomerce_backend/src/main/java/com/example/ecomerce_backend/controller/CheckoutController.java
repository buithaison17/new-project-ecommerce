package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.CancelCheckoutRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.CreateCheckoutResponse;
import com.example.ecomerce_backend.model.dto.response.PaymentStatusResponse;
import com.example.ecomerce_backend.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment-requests")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutService checkoutService;

    @PostMapping
    public ResponseEntity<ApiDataResponse<CreateCheckoutResponse>> handleCheckoutOrder(@Valid @RequestBody CreateOrderRequest request) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Tạo đơn hàng thành công",
                checkoutService.handleCheckoutOrder(request),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiDataResponse<String>> cancelCheckoutRequest(
            @PathVariable Long orderId
    ) {
        checkoutService.cancelCheckout(orderId);
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Hủy thanh toán thành công",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/{orderId}/status")
    public ResponseEntity<ApiDataResponse<PaymentStatusResponse>> checkPaymentStatus(
            @PathVariable Long orderId
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Kiểm tra trạng thái thanh toán thành công",
                checkoutService.checkPaymentStatus(orderId),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping("/webhook-handler")
    public ResponseEntity<ApiDataResponse<Void>> handlerWebhook(@RequestBody Object webHookData) {
        checkoutService.handleWebHook(webHookData);
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Xử lý thanh toán thành công",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    
}