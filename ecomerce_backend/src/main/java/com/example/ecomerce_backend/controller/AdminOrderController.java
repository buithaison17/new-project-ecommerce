package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.constants.OrderStatus;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Secured("ROLE_ADMIN")
public class AdminOrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiDataResponse<Page<OrderResponse>>> getOrders(
            @RequestParam(value = "currentPage", defaultValue = "1") Integer currentPage,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "orderStatus", required = false) OrderStatus orderStatus
    ) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Lấy danh sách đơn hàng thành công",
                orderService.findAll(currentPage, pageSize, orderStatus),
                null,
                HttpStatus.OK
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDataResponse<List<OrderItemResponse>>> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Lấy chi tiết đơn hàng thành công",
                orderService.getOrderDetail(id),
                null,
                HttpStatus.OK
        ));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiDataResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateStatusRequest request
    ) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Cập nhật trạng thái đơn hàng thành công",
                orderService.updateStatus(id, request),
                null,
                HttpStatus.OK
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiDataResponse<OrderResponse>> updateStatusWithSubpath(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateStatusRequest request
    ) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Cập nhật trạng thái đơn hàng thành công",
                orderService.updateStatus(id, request),
                null,
                HttpStatus.OK
        ));
    }
}

