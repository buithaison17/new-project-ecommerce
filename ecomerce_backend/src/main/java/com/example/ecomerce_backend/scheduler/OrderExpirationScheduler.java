package com.example.ecomerce_backend.scheduler;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.repository.OrderRepository;
import com.example.ecomerce_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpirationScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * Chạy mỗi 5 phút để kiểm tra và hủy các đơn hàng thanh toán online đã hết hạn.
     * Điều kiện hủy:
     * - Phương thức thanh toán là CREDIT_CARD
     * - Trạng thái đơn hàng là PENDING
     * - Trạng thái thanh toán là PENDING
     * - Thời gian hiện tại lớn hơn expiredAt
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300000 ms
    @Transactional
    public void cancelExpiredOnlinePaymentOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> expiredOrders = orderRepository.findExpiredOnlinePaymentOrders(now);

        if (expiredOrders.isEmpty()) {
            log.debug("Không có đơn hàng thanh toán online nào hết hạn");
            return;
        }

        log.info("Tìm thấy {} đơn hàng thanh toán online hết hạn, bắt đầu hủy...", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                // Kiểm tra lại điều kiện trước khi hủy để tránh race condition
                if (order.getOrderStatus() == OrderStatus.PENDING
                        && order.getPaymentMethod() == PaymentMethod.CREDIT_CARD
                        && order.getPaymentStatus() == PaymentStatus.PENDING
                        && order.getExpiredAt() != null
                        && now.isAfter(order.getExpiredAt())) {
                    
                    orderService.cancelOrder(order);
                    log.info("Đã hủy đơn hàng ID {} do hết hạn thanh toán (expiredAt: {})", 
                            order.getId(), order.getExpiredAt());
                } else {
                    log.debug("Đơn hàng ID {} không thỏa điều kiện hủy, bỏ qua", order.getId());
                }
            } catch (Exception e) {
                log.error("Lỗi khi hủy đơn hàng ID {}: {}", order.getId(), e.getMessage(), e);
            }
        }

        log.info("Hoàn tất việc hủy {} đơn hàng thanh toán online hết hạn", expiredOrders.size());
    }
}
