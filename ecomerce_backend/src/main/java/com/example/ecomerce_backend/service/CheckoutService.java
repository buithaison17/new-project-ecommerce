package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.CheckoutException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.request.CancelOrderRequest;
import com.example.ecomerce_backend.model.dto.response.CreateCheckoutResponse;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.entity.Transaction;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.repository.OrderRepository;
import com.example.ecomerce_backend.repository.TransactionRepository;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
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
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.webhooks.WebhookData;

import java.time.Duration;
import java.time.Instant;
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
        if (request.paymentMethod().equals("COD")) {
            throw new BadRequestException("Chỉ áp dụng khi thanh toán bằng hình thức chuyển khoản");
        }
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        try {
            // Tạo đơn hàng
            OrderResponse orderResponse = orderService.createOrder(request);
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
                    .order(orderRepository.findById(orderResponse.id()).get())
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
        } catch (RuntimeException e) {
            throw new CheckoutException("Đã xảy ra lỗi khi thanh toán");
        }
    }

    @Transactional
    // Chưa thanh toán và muốn hủy đơn
    public void cancelCheckout(Long orderId) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        Transaction transaction = transactionRepository.findByOrderIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại"));
        if (transaction.getStatus() != PaymentLinkStatus.PENDING) {
            throw new CheckoutException("Bạn chỉ có thể hủy khi chưa thanh toán");
        }
        if (transaction.getStatus() == PaymentLinkStatus.CANCELLED) {
            throw new CheckoutException("Giao dịch đã huyt trước đó");
        }
        orderService.cancelOrder(transaction.getOrder());
        payOS.paymentRequests().cancel(transaction.getPaymentLinkId());
    }

    @Transactional
    public void handleWebHook(Object object) {
        WebhookData webhookData;
        try {
            webhookData = payOS.webhooks().verify(object);
        } catch (Exception e) {
            throw new CheckoutException("Đã xảy ra lỗi khi thanh toán vui lòng thử lại");
        }
        Transaction transaction = transactionRepository.findByOrderCode(webhookData.getOrderCode())
                .orElseThrow(() -> new NotFoundException("Đã xảy ra lỗi khi thanh toán"));
//         Lưu thông tin để hoàn tiền khi cần
        if (!webhookData.getReference().isBlank()) {
            String reference = webhookData.getReference();
            transaction.setReference(reference);
        }
        if (!webhookData.getCounterAccountNumber().isBlank()) {
            String accountNumber = webhookData.getCounterAccountNumber();
            transaction.setAccountNumber(accountNumber);
        }
        // Kiểm tra mã trạng thái
        if (!webhookData.getCode().equals("00")) {
            throw new CheckoutException("Giao dịch không thành công với mã code " + webhookData.getCode());
        }
        // Kiểm tra xem đơn hàng đã được xử lý chức tránh trùng lặp
        if (transaction.getStatus() == PaymentLinkStatus.PAID) {
            // Cập nhật trạng thái giao dịch và lưu vào database
            transaction.setStatus(PaymentLinkStatus.PAID);
            transaction.getOrder().setPaymentStatus(PaymentStatus.COMPLETED);
        }
    }

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
        } catch (Exception e) {
            throw new CheckoutException("Đã xảy ra lỗi khi hoàn tiền vui lòng thử lại");
        }
    }
}