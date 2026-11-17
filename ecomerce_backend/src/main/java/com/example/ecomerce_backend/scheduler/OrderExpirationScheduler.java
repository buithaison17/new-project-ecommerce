package com.example.ecomerce_backend.scheduler;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.model.entity.Transaction;
import com.example.ecomerce_backend.repository.TransactionRepository;
import com.example.ecomerce_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpirationScheduler {

    private final TransactionRepository transactionRepository;
    private final OrderService orderService;
    private final vn.payos.PayOS payOS;

    /**
     * Chạy mỗi 5 phút để kiểm tra và hủy các đơn hàng thanh toán online đã hết hạn.
     * Điều kiện hủy:
     * - Phương thức thanh toán là CREDIT_CARD
     * - Trạng thái đơn hàng là PENDING
     * - Trạng thái thanh toán là PENDING
     * - Thời gian hiện tại lớn hơn expiredAt của transaction
     */
    @Scheduled(fixedRate = 60000) // 1 phút
    @Transactional
    public void cancelExpiredOnlinePaymentOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Transaction> expiredTransactions = transactionRepository.findExpiredTransactions(now);

        if (expiredTransactions.isEmpty()) {
            log.debug("Không có giao dịch thanh toán online nào hết hạn");
            return;
        }

        log.info("Tìm thấy {} giao dịch thanh toán online hết hạn, bắt đầu hủy...", expiredTransactions.size());

        for (Transaction transaction : expiredTransactions) {
            try {
                Order order = transaction.getOrder();

                // Kiểm tra lại điều kiện trước khi hủy để tránh race condition
                if (order.getOrderStatus() == OrderStatus.PENDING
                        && order.getPaymentMethod() == PaymentMethod.CREDIT_CARD
                        && order.getPaymentStatus() == PaymentStatus.PENDING
                        && transaction.getExpiredAt() != null
                        && now.isAfter(transaction.getExpiredAt())) {

                    // Hủy payment link trước để tránh người dùng thanh toán sau khi đơn đã hủy
                    if (transaction.getStatus() == PaymentLinkStatus.PENDING) {
                        try {
//                            payOS.paymentRequests().cancel(transaction.getPaymentLinkId());
                            transaction.setStatus(PaymentLinkStatus.CANCELLED);
                            transactionRepository.save(transaction);
                            log.info("Đã hủy payment link cho đơn hàng ID {}", order.getId());
                        } catch (Exception e) {
                            log.error("Lỗi khi hủy payment link cho đơn hàng ID {}: {}", order.getId(), e.getMessage(), e);
                        }
                    }

                    orderService.cancelOrder(order);
                    log.info("Đã hủy đơn hàng ID {} do hết hạn thanh toán (expiredAt: {})",
                            order.getId(), transaction.getExpiredAt());
                } else {
                    log.debug("Đơn hàng ID {} không thỏa điều kiện hủy, bỏ qua", order.getId());
                }
            } catch (Exception e) {
                log.error("Lỗi khi hủy giao dịch ID {}: {}", transaction.getId(), e.getMessage(), e);
            }
        }

        log.info("Hoàn tất việc hủy {} giao dịch thanh toán online hết hạn", expiredTransactions.size());
    }
}
