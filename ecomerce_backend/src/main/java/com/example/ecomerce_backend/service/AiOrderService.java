package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CancelOrderRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderItemRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.response.AiCancelOrderResponse;
import com.example.ecomerce_backend.model.dto.response.AiDeliveryAddressResponse;
import com.example.ecomerce_backend.model.dto.response.AiOrderDetailResponse;
import com.example.ecomerce_backend.model.dto.response.AiOrderItemResponse;
import com.example.ecomerce_backend.model.dto.response.AiOrderSummaryResponse;
import com.example.ecomerce_backend.model.dto.response.AiPlaceOrderResponse;
import com.example.ecomerce_backend.model.dto.response.CreateCheckoutResponse;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.model.entity.OrderItem;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserDelivery;
import com.example.ecomerce_backend.repository.OrderItemRepository;
import com.example.ecomerce_backend.repository.OrderRepository;
import com.example.ecomerce_backend.repository.UserDeliveryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiOrderService {

    private final OrderService orderService;
    private final CheckoutService checkoutService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserDeliveryRepository userDeliveryRepository;
    private final ObjectMapper objectMapper;

    public List<AiOrderSummaryResponse> getMyOrders(User user, String status, int page, int size) {
        OrderStatus orderStatus = parseOrderStatus(status);
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 20);
        Pageable pageable = PageRequest.of(safePage - 1, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orders = orderStatus == null
                ? orderRepository.findByIsDeletedAndUser(false, user, pageable)
                : orderRepository.findByIsDeletedAndUserAndOrderStatus(false, user, orderStatus, pageable);
        return orders.getContent().stream().map(this::toSummary).toList();
    }

    public AiOrderDetailResponse getOrderDetail(User user, Long orderId) {
        Order order = findOrderForUser(user, orderId);
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        List<AiOrderItemResponse> itemResponses = items.stream().map(item -> new AiOrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalAmount()
        )).toList();
        return new AiOrderDetailResponse(
                order.getId(),
                order.getOrderStatus().name(),
                order.getPaymentMethod().name(),
                order.getPaymentStatus().name(),
                order.getTotalAmount(),
                order.getShippingAmount(),
                order.getFinalAmount(),
                order.getNote(),
                order.getCreatedAt(),
                order.getDelivery().getAddress(),
                order.getDelivery().getPhoneNumber(),
                itemResponses
        );
    }

    @Transactional
    public AiPlaceOrderResponse placeOrder(User user, String itemsJson, Long deliveryId, String paymentMethod, String note) {
        requireCustomer(user);
        List<CreateOrderItemRequest> items = parseItems(itemsJson);
        String normalizedPaymentMethod = paymentMethod == null ? "" : paymentMethod.toUpperCase();
        if (!"CASH".equals(normalizedPaymentMethod) && !"CREDIT_CARD".equals(normalizedPaymentMethod)) {
            throw new BadRequestException("Phương thức thanh toán phải là CASH hoặc CREDIT_CARD");
        }
        CreateOrderRequest request = new CreateOrderRequest(items, deliveryId, normalizedPaymentMethod, note);
        if ("CREDIT_CARD".equals(normalizedPaymentMethod)) {
            CreateCheckoutResponse checkout = checkoutService.handleCheckoutOrder(user, request);
            Order order = orderRepository.findById(checkout.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
            return new AiPlaceOrderResponse(
                    order.getId(),
                    order.getOrderStatus().name(),
                    order.getPaymentMethod().name(),
                    order.getPaymentStatus().name(),
                    order.getFinalAmount(),
                    checkout.checkoutUrl(),
                    "Đơn hàng đã được tạo. Vui lòng thanh toán qua link: " + checkout.checkoutUrl()
            );
        }
        OrderResponse orderResponse = orderService.createOrder(user, request);
        return new AiPlaceOrderResponse(
                orderResponse.id(),
                orderResponse.orderStatus(),
                orderResponse.paymentMethod().name(),
                orderResponse.paymentStatus().name(),
                orderResponse.finalAmount(),
                null,
                "Đặt hàng thành công. Đơn hàng sẽ được giao và thanh toán khi nhận hàng (COD)."
        );
    }

    @Transactional
    public AiCancelOrderResponse cancelOrder(User user, Long orderId, String bin, String accountNumber) {
        requireCustomer(user);
        Order order = findOrderForUser(user, orderId);
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING");
        }
        if (order.getPaymentMethod() == PaymentMethod.CREDIT_CARD && order.getPaymentStatus() == PaymentStatus.PENDING) {
            checkoutService.cancelCheckout(user, orderId);
            Order cancelled = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
            return new AiCancelOrderResponse(
                    cancelled.getId(),
                    cancelled.getOrderStatus().name(),
                    "Đã hủy đơn hàng và link thanh toán."
            );
        }
        if (order.getPaymentMethod() == PaymentMethod.CREDIT_CARD && order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            if (bin == null || bin.isBlank() || accountNumber == null || accountNumber.isBlank()) {
                throw new BadRequestException("Đơn đã thanh toán online, cần cung cấp mã BIN ngân hàng và số tài khoản để hoàn tiền");
            }
            orderService.cancelOrder(user, orderId, new CancelOrderRequest(accountNumber, bin));
        } else {
            orderService.cancelOrder(user, orderId, new CancelOrderRequest(null, null));
        }
        Order cancelled = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        return new AiCancelOrderResponse(
                cancelled.getId(),
                cancelled.getOrderStatus().name(),
                "Đã hủy đơn hàng thành công."
        );
    }

    public List<AiDeliveryAddressResponse> getDeliveryAddresses(User user) {
        return userDeliveryRepository.findByUser(user).stream()
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .map(d -> new AiDeliveryAddressResponse(d.getId(), d.getAddress(), d.getPhoneNumber()))
                .toList();
    }

    @Transactional
    public AiDeliveryAddressResponse createDeliveryAddress(User user, String address, String phoneNumber) {
        requireCustomer(user);
        UserDelivery delivery = userDeliveryRepository.save(UserDelivery.builder()
                .user(user)
                .address(address)
                .phoneNumber(phoneNumber)
                .build());
        return new AiDeliveryAddressResponse(delivery.getId(), delivery.getAddress(), delivery.getPhoneNumber());
    }

    private AiOrderSummaryResponse toSummary(Order order) {
        long itemCount = orderItemRepository.countByOrder(order);
        return new AiOrderSummaryResponse(
                order.getId(),
                order.getOrderStatus().name(),
                order.getPaymentMethod().name(),
                order.getPaymentStatus().name(),
                order.getFinalAmount(),
                order.getCreatedAt(),
                (int) itemCount
        );
    }

    private Order findOrderForUser(User user, Long orderId) {
        return orderRepository.findByIdAndUser(orderId, user)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
    }

    private OrderStatus parseOrderStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái đơn hàng không hợp lệ: " + status);
        }
    }

    private List<CreateOrderItemRequest> parseItems(String itemsJson) {
        try {
            return objectMapper.readValue(
                    itemsJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, CreateOrderItemRequest.class)
            );
        } catch (Exception e) {
            throw new BadRequestException("Danh sách sản phẩm không hợp lệ, cần dạng JSON array với productId và quantity");
        }
    }

    private void requireCustomer(User user) {
        if (user.getRole() == null || !"CUSTOMER".equals(user.getRole().getName())) {
            throw new BadRequestException("Chỉ khách hàng mới có thể thực hiện thao tác này");
        }
    }
}
