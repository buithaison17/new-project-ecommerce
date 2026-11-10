package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.DashboardSummaryResponse;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.repository.InventoryRepository;
import com.example.ecomerce_backend.repository.OrderRepository;
import com.example.ecomerce_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Secured("ROLE_ADMIN")
public class AdminDashboardController {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Value("${app.low-stock-threshold:5}")
    private int lowStockThreshold;

    @GetMapping("/summary")
    public ResponseEntity<ApiDataResponse<DashboardSummaryResponse>> getSummary() {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .toList();

        long totalOrders = orders.size();
        LocalDate today = LocalDate.now();
        long ordersToday = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().isEqual(today))
                .count();

        Map<OrderStatus, Long> ordersByStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, 0L);
        }
        for (Order o : orders) {
            ordersByStatus.merge(o.getOrderStatus(), 1L, Long::sum);
        }

        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED || o.getPaymentStatus() == PaymentStatus.COMPLETED)
                .map(Order::getFinalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalProducts = productRepository.countActive();

        var inventories = inventoryRepository.findAll();
        long outOfStockProducts = inventories.stream()
                .filter(i -> i.availableQuantity() <= 0)
                .count();

        long lowStockProducts = inventories.stream()
                .filter(i -> i.availableQuantity() < lowStockThreshold)
                .count();

        DashboardSummaryResponse summary = new DashboardSummaryResponse(
                totalOrders,
                ordersToday,
                ordersByStatus,
                totalRevenue,
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                lowStockThreshold
        );

        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Lấy số liệu tổng quan thành công",
                summary,
                null,
                HttpStatus.OK
        ));
    }
}

