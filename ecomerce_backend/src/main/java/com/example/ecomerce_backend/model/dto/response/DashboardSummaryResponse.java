package com.example.ecomerce_backend.model.dto.response;

import com.example.ecomerce_backend.constants.OrderStatus;

import java.math.BigDecimal;
import java.util.Map;

/** Số liệu tổng quan cho trang Admin Dashboard. */
public record DashboardSummaryResponse(
        /** Tổng số đơn hàng (mọi trạng thái, kể cả đã hủy). */
        long totalOrders,
        /** Số đơn tạo trong ngày hôm nay (theo giờ Việt Nam). */
        long ordersToday,
        /** Số đơn theo từng trạng thái; luôn có đủ 5 trạng thái, trạng thái chưa có đơn là 0. */
        Map<OrderStatus, Long> ordersByStatus,
        /** Doanh thu = tổng finalAmount của các đơn đã COMPLETED. */
        BigDecimal totalRevenue,
        /** Số sản phẩm đang bán (chưa bị ẩn/xóa). */
        long totalProducts,
        /** Số sản phẩm có tồn kho khả dụng dưới ngưỡng cảnh báo (đã bao gồm sản phẩm hết hàng). */
        long lowStockProducts,
        /** Số sản phẩm đã hết hàng (tồn kho khả dụng = 0). */
        long outOfStockProducts,
        /** Ngưỡng cảnh báo đang áp dụng (SRS: 5). */
        int lowStockThreshold
) {
}