package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.model.dto.request.CancelOrderRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.request.OrderUpdateStatusRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.OrderItemResponse;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @Secured("ROLE_ADMIN")
    @GetMapping
    public ResponseEntity<ApiDataResponse<Page<OrderResponse>>> findAll(
            @RequestParam(value = "currentPage", defaultValue = "1") Integer currentPage,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "orderStatus", required = false) OrderStatus orderStatus
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy danh sách đơn hàng thành công",
                orderService.findAll(currentPage, pageSize, orderStatus),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @Secured("ROLE_CUSTOMER")
    @GetMapping("/users")
    public ResponseEntity<ApiDataResponse<Page<OrderResponse>>> getOrdersOfUser(
            @RequestParam(value = "currentPage", defaultValue = "1") Integer currentPage,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "orderStatus", required = false) OrderStatus orderStatus
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy danh sách đơn hàng thành công",
                orderService.findAllByUser(currentPage, pageSize, orderStatus),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDataResponse<List<OrderItemResponse>>> getOrderDetail(@PathVariable Long id) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy danh sách đơn hàng thành công",
                orderService.getOrderDetail(id),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @Secured("ROLE_CUSTOMER")
    @PostMapping
    public ResponseEntity<ApiDataResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đặt hàng thành công",
                orderService.createOrder(request),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @Secured("ROLE_ADMIN")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiDataResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateStatusRequest request
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật trạng thái đơn hàng thành công",
                orderService.updateStatus(id, request),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @Secured("ROLE_CUSTOMER")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiDataResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody CancelOrderRequest request
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật trạng thái đơn hàng thành công",
                orderService.cancelOrder(id, request),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }
}