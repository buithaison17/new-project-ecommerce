package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.CheckoutException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.request.CancelOrderRequest;
import com.example.ecomerce_backend.model.dto.response.CreateCheckoutResponse;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.dto.response.PaymentStatusResponse;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.model.entity.Transaction;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.repository.OrderRepository;
import com.example.ecomerce_backend.repository.TransactionRepository;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.exception.NotFoundException;
import vn.payos.model.v1.payouts.PayoutRequests;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.webhooks.WebhookData;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
public class CheckoutService {
    private final OrderService orderService;
    private final PayOS payOS;
    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private static final AtomicLong ORDER_CODE_GENERATOR =
            new AtomicLong(System.currentTimeMillis() / 1000);
    @Value("${frontend.url}")
    private String frontendUrl;

    public CheckoutService(
            @Lazy OrderService orderService,
            PayOS payOS,
            OrderRepository orderRepository,
            TransactionRepository transactionRepository
    ) {
        this.orderService = orderService;
        this.payOS = payOS;
        this.orderRepository = orderRepository;
        this.transactionRepository = transactionRepository;
    }

    private long generateOrderCode() {
        return ORDER_CODE_GENERATOR.incrementAndGet();
    }

    @Transactional
    public CreateCheckoutResponse handleCheckoutOrder(CreateOrderRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return handleCheckoutOrder(userPrincipal.getUser(), request);
    }

    @Transactional
    public CreateCheckoutResponse handleCheckoutOrder(User user, CreateOrderRequest request) {
        if (request.paymentMethod().equals("COD")) {
            throw new BadRequestException("Chỉ áp dụng khi thanh toán bằng hình thức chuyển khoản");
        }
        OrderResponse orderResponse = null;
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(10);
        try {
            // Tạo đơn hàng
            orderResponse = orderService.createOrder(user, request);
            // Cập nhật expiredAt cho đơn hàng
            Order order = orderRepository.findById(orderResponse.id()).get();
            order.setExpiredAt(expiredAt);
            orderRepository.save(order);
            // Tạo mã thanh toán
            Long orderCode = generateOrderCode();
            CreatePaymentLinkRequest createPaymentLinkRequest = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(orderResponse.finalAmount().longValue())
                    .description("Thanh toán đơn hàng " + orderResponse.id())
                    .returnUrl(frontendUrl + "/checkout/success")
                    .cancelUrl("")
                    .expiredAt(Instant.now().plus(Duration.ofMinutes(10)).getEpochSecond()) // Hết hạn trong 10 phút
                    .build();
            CreatePaymentLinkResponse createPaymentLinkResponse = payOS.paymentRequests().create(createPaymentLinkRequest);
            // Tạo giao dịch
            Transaction transaction = Transaction.builder()
                    .user(user)
                    .orderCode(orderCode)
                    .order(orderRepository.findById(orderResponse.id()).orElseThrow(() -> new ResourceNotFoundException("Order không tồn tại")))
                    .paymentLinkId(createPaymentLinkResponse.getPaymentLinkId())
                    .status(createPaymentLinkResponse.getStatus())
                    .build();
            transactionRepository.save(transaction);
            return new CreateCheckoutResponse(
                    orderResponse.id(),
                    orderCode,
                    createPaymentLinkResponse.getCheckoutUrl(),
                    createPaymentLinkResponse.getPaymentLinkId(),
                    createPaymentLinkResponse.getStatus(),
                    createPaymentLinkResponse.getQrCode()
            );
        } catch (Exception e) {
            // Rollback: Hủy đơn hàng và hoàn trả tồn kho nếu tạo payment link thất bại
            if (orderResponse != null) {
                try {
                    Order order = orderRepository.findById(orderResponse.id()).orElse(null);
                    if (order != null) {
                        orderService.cancelOrder(order);
                    }
                } catch (Exception rollbackException) {
                    log.error("Lỗi khi rollback đơn hàng sau khi payment thất bại: {}", rollbackException.getMessage());
                }
            }
            log.error("Lỗi khi tạo payment link: {}", e.getMessage(), e);
            throw new CheckoutException("Đã xảy ra lỗi khi thanh toán: " + e.getMessage());
        }
    }

    @Transactional
    // Chưa thanh toán và muốn hủy đơn
    public void cancelCheckout(Long orderId) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        cancelCheckout(userPrincipal.getUser(), orderId);
    }

    @Transactional
    public void cancelCheckout(User user, Long orderId) {
        Transaction transaction = transactionRepository.findByOrderIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại"));
        if (transaction.getStatus() != PaymentLinkStatus.PENDING) {
            throw new CheckoutException("Bạn chỉ có thể hủy khi chưa thanh toán");
        }
        if (transaction.getStatus() == PaymentLinkStatus.CANCELLED) {
            throw new CheckoutException("Giao dịch đã hủy trước đó");
        }
        // Hủy payment link trước để tránh người dùng thanh toán sau khi đơn đã hủy
        try {
            payOS.paymentRequests().cancel(transaction.getPaymentLinkId());
            transaction.setStatus(PaymentLinkStatus.CANCELLED);
            transactionRepository.save(transaction);
        } catch (Exception e) {
            log.error("Lỗi khi hủy payment link: {}", e.getMessage(), e);
            // Vẫn tiếp tục hủy đơn hàng ngay cả khi payment link hủy thất bại
        }
        orderService.cancelOrder(transaction.getOrder());
    }

    /**
     * Kiểm tra trạng thái thanh toán thực tế từ PayOS và đồng bộ về DB.
     * Dùng khi webhook chưa về kịp (người dùng quay lại từ trang PayOS).
     */
    @Transactional
    public PaymentStatusResponse checkPaymentStatus(Long orderId) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        Transaction transaction = transactionRepository.findByOrderIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại"));
        PaymentLink paymentLink;
        try {
            paymentLink = payOS.paymentRequests().get(transaction.getPaymentLinkId());
        } catch (Exception e) {
            log.error("Lỗi khi lấy trạng thái payment link {}: {}", transaction.getPaymentLinkId(), e.getMessage(), e);
            throw new CheckoutException("Không thể kiểm tra trạng thái thanh toán: " + e.getMessage());
        }
        PaymentLinkStatus remoteStatus = paymentLink.getStatus();
        // Đồng bộ trạng thái nếu PayOS đã cập nhật mà webhook chưa xử lý
        if (remoteStatus == PaymentLinkStatus.PAID && transaction.getStatus() != PaymentLinkStatus.PAID) {
            transaction.setStatus(PaymentLinkStatus.PAID);
            transaction.getOrder().setPaymentStatus(PaymentStatus.COMPLETED);
            transactionRepository.save(transaction);
            orderRepository.save(transaction.getOrder());
            log.info("Đồng bộ thanh toán thành công cho orderId {} qua check status", orderId);
        } else if (remoteStatus != transaction.getStatus()) {
            transaction.setStatus(remoteStatus);
            transactionRepository.save(transaction);
        }
        Order order = transaction.getOrder();
        return new PaymentStatusResponse(
                order.getId(),
                transaction.getOrderCode(),
                remoteStatus.name(),
                order.getPaymentStatus().name(),
                order.getFinalAmount()
        );
    }

    @Transactional
    public void handleWebHook(Object object) {
        WebhookData webhookData;
        try {
            webhookData = payOS.webhooks().verify(object);
        } catch (Exception e) {
            log.error("Lỗi khi verify webhook: {}", e.getMessage(), e);
            throw new CheckoutException("Đã xảy ra lỗi khi thanh toán vui lòng thử lại");
        }
        if (webhookData.getOrderCode().equals(123L)) {
            return;
        }
        Transaction transaction = transactionRepository.findByOrderCode(webhookData.getOrderCode())
                .orElseThrow(() -> new NotFoundException("Đã xảy ra lỗi khi thanh toán"));
        // Lưu thông tin để hoàn tiền khi cần
        if (!webhookData.getReference().isBlank()) {
            transaction.setReference(webhookData.getReference());
        }
        if (!webhookData.getCounterAccountNumber().isBlank()) {
            transaction.setAccountNumber(webhookData.getCounterAccountNumber());
        }
        // Kiểm tra mã trạng thái
        if (!webhookData.getCode().equals("00")) {
            log.error("Giao dịch không thành công với mã code {} cho orderCode {}", webhookData.getCode(), webhookData.getOrderCode());
            throw new CheckoutException("Giao dịch không thành công với mã code " + webhookData.getCode());
        }
        // Kiểm tra xem đơn hàng đã được xử lý để tránh trùng lặp
        if (transaction.getStatus() != PaymentLinkStatus.PAID) {
            transaction.setStatus(PaymentLinkStatus.PAID);
            transaction.getOrder().setPaymentStatus(PaymentStatus.COMPLETED);
            transactionRepository.save(transaction);
            orderRepository.save(transaction.getOrder());
            log.info("Thanh toán thành công cho orderCode {}, orderId {}", webhookData.getOrderCode(), transaction.getOrder().getId());
        } else {
            log.info("Giao dịch orderCode {} đã được xử lý trước đó", webhookData.getOrderCode());
        }
    }

    @Transactional
    public void refund(Transaction transaction, CancelOrderRequest request) {
        if ((request.bin() == null || request.bin().isBlank()) && (request.accountNumber() == null || request.accountNumber().isBlank())) {
            throw new BadRequestException("Không thể hoàn tiền do thiếu thông tin");
        }
        try {
            PayoutRequests payoutRequests = PayoutRequests.builder()
                    .amount(transaction.getOrder().getFinalAmount().longValue())
                    .description("Hoàn tiền cho đơn hàng " + transaction.getOrder().getId())
                    .referenceId(transaction.getReference())
                    .toBin(request.bin())
                    .toAccountNumber(request.accountNumber())
                    .build();
            payOS.payouts().create(payoutRequests);
            log.info("Hoàn tiền thành công cho orderId {}, amount {}", transaction.getOrder().getId(), transaction.getOrder().getFinalAmount());
        } catch (Exception e) {
            log.error("Lỗi khi hoàn tiền cho orderId {}: {}", transaction.getOrder().getId(), e.getMessage(), e);
            throw new CheckoutException("Đã xảy ra lỗi khi hoàn tiền vui lòng thử lại: " + e.getMessage());
        }
    }
}