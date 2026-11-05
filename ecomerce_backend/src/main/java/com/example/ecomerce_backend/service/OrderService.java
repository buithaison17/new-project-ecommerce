package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CancelOrderRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderItemRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.request.OrderUpdateStatusRequest;
import com.example.ecomerce_backend.model.dto.response.OrderItemResponse;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.entity.*;
import com.example.ecomerce_backend.model.mapper.OrderMapper;
import com.example.ecomerce_backend.repository.*;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderService {
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;
    private final BigDecimal SHIPPING_AMOUNT = BigDecimal.valueOf(1000);

    /**
     * Luật chuyển trạng thái đơn hàng:
     * PENDING -> SHIPPED -> DELIVERED; chỉ được hủy (CANCELLED) khi đơn còn PENDING.
     * DELIVERED và CANCELLED là trạng thái cuối, không chuyển tiếp được.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(),
            OrderStatus.CANCELLED, Set.of()
    );
    private final UserDeliveryRepository userDeliveryRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final TransactionRepository transactionRepository;
    private final CheckoutService checkoutService;
    private final UserInformationRepository userInformationRepository;

    public OrderService(
            InventoryService inventoryService,
            InventoryRepository inventoryRepository,
            UserDeliveryRepository userDeliveryRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OrderMapper orderMapper,
            TransactionRepository transactionRepository,
            @Lazy CheckoutService checkoutService,
            UserInformationRepository userInformationRepository
    ) {
        this.inventoryService = inventoryService;
        this.inventoryRepository = inventoryRepository;
        this.userDeliveryRepository = userDeliveryRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderMapper = orderMapper;
        this.transactionRepository = transactionRepository;
        this.checkoutService = checkoutService;
        this.userInformationRepository = userInformationRepository;
    }

    // Lấy toàn bộ danh sách đơn hàng (ADMIN)
    public Page<OrderResponse> findAll(Integer currentPage, Integer pageSize, OrderStatus orderStatus) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(currentPage - 1, pageSize, sort);
        if (orderStatus == null) {
            Page<Order> orders = orderRepository.findByIsDeleted(false, pageable);
            return orders.map(order -> {
                UserInformation userInformation = userInformationRepository.findByUserId(order.getUser().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Thông tin người dùng không tồn tại"));
                return orderMapper.toOrderResponse(order, userInformation);
            });
        }
        Page<Order> orders = orderRepository.findByIsDeletedAndOrderStatus(false, orderStatus, pageable);
        return orders.map(order -> {
            UserInformation userInformation = userInformationRepository.findByUserId(order.getUser().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Thông tin người dùng không tồn tại"));
            return orderMapper.toOrderResponse(order, userInformation);
        });
    }

    // Lấy danh sách đơn hàng của người dùng
    public Page<OrderResponse> findAllByUser(Integer currentPage, Integer pageSize, OrderStatus orderStatus) {
        // Lấy thông tin người dùng
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        // Phân trang
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(currentPage - 1, pageSize, sort);
        if (orderStatus == null) {
            return orderRepository.findByIsDeletedAndUser(false, user, pageable)
                    .map(orderMapper::toOrderResponse);
        }
        return orderRepository.findByIsDeletedAndUserAndOrderStatus(false, user, orderStatus, pageable)
                .map(orderMapper::toOrderResponse);
    }

    // Chi tiết đơn hàng
    public List<OrderItemResponse> getOrderDetail(Long id) {
        // Lấy thông tin người dùng
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        return orderMapper.toOrderItemResponseList(orderItems);
    }

    // Chi tiết đơn hàng bất kỳ (ADMIN) - không lọc theo người dùng đang đăng nhập
    public List<OrderItemResponse> getOrderDetailForAdmin(Long id) {
        Order order = orderRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        return orderMapper.toOrderItemResponseList(orderItemRepository.findByOrder(order));
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Lấy thông tin người dùng
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        // Lấy tồn kho
        List<Inventory> inventories = request.items().stream().map(item ->
                inventoryRepository.findByProductId(item.productId())
                        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"))
        ).toList();
        // Tạo map product
        Map<Long, Product> productMap = inventories.stream()
                .collect(Collectors.toMap(
                        inventory -> inventory.getProduct().getId(),
                        Inventory::getProduct));
        Map<Long, Integer> quantityMap = request.items().stream()
                .collect(Collectors.toMap(
                        CreateOrderItemRequest::productId,
                        CreateOrderItemRequest::quantity));
        // Tính tổng tiền
        BigDecimal totalAmount = productMap.values().stream()
                .map(product -> product.getPrice().multiply(BigDecimal.valueOf(quantityMap.get(product.getId()))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // Lấy địa chỉ nhận hàng
        UserDelivery userDelivery = userDeliveryRepository.findByIdAndUser(request.deliveryId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ nhận hàng không tồn tại"));
        PaymentMethod paymentMethod = PaymentMethod.valueOf(request.paymentMethod().toUpperCase());
        // Tạo order
        Order order = Order.builder()
                .totalAmount(totalAmount)
                .user(user)
                .totalAmount(totalAmount)
                .shippingAmount(SHIPPING_AMOUNT)
                .finalAmount(totalAmount.add(SHIPPING_AMOUNT))
                .delivery(userDelivery)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.PENDING)
                .note(request.note())
                .build();
        Order finalOrder = orderRepository.save(order);
        // Tạo order items
        List<OrderItem> orderItems = request.items().stream().map(item -> OrderItem.builder()
                .order(finalOrder)
                .totalAmount(
                        productMap.get(item.productId()).getPrice().multiply(BigDecimal.valueOf(item.quantity()))
                )
                .product(productMap.get(item.productId()))
                .quantity(item.quantity())
                .unitPrice(productMap.get(item.productId()).getPrice())
                .build()).toList();
        orderItemRepository.saveAll(orderItems);
        // Trừ tồn kho
        request.items().forEach(item -> {
            if (productMap.get(item.productId()).getIsDeleted() == true) {
                throw new ResourceNotFoundException("Sản phẩm không tồn tại");
            }
            inventoryService.decreaseStock(item.productId(), item.quantity());
        });
        return orderMapper.toOrderResponse(order);
    }

    /**
     * Cập nhật trạng thái đơn hàng.
     * - ADMIN: chỉ được chuyển theo {@link #ALLOWED_TRANSITIONS} và phải thỏa điều kiện nghiệp vụ.
     * - Người dùng thường: chỉ được hủy đơn của chính mình.
     * Đơn thanh toán online (CREDIT_CARD) đã thanh toán không hủy qua đây vì cần hoàn tiền,
     * phải dùng chức năng hủy đơn có thông tin tài khoản nhận hoàn tiền.
     */
    @Transactional
    public OrderResponse updateStatus(Long id, OrderUpdateStatusRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        boolean isAdmin = "ADMIN".equals(user.getRole().getName());
        OrderStatus target = request.status();

        // Khóa dòng đơn hàng để hai request đồng thời không xử lý cùng một đơn
        Order order = orderRepository.findWithLockById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .filter(o -> isAdmin || o.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        if (!isAdmin && target != OrderStatus.CANCELLED) {
            throw new BadRequestException("Bạn chỉ được phép hủy đơn hàng");
        }

        OrderStatus current = order.getOrderStatus();
        if (current == target) {
            throw new BadRequestException("Đơn hàng đã ở trạng thái " + target);
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(current, Set.of()).contains(target)) {
            throw new BadRequestException("Không thể chuyển đơn hàng từ " + current + " sang " + target);
        }

        boolean paidOnline = order.getPaymentMethod() == PaymentMethod.CREDIT_CARD;
        boolean paymentCompleted = order.getPaymentStatus() == PaymentStatus.COMPLETED;

        switch (target) {
            case CANCELLED -> {
                if (paidOnline && paymentCompleted) {
                    throw new BadRequestException(
                            "Đơn đã thanh toán online, cần hủy bằng chức năng hủy đơn kèm thông tin hoàn tiền");
                }
                cancelOrder(order);
            }
            case SHIPPED -> {
                // Thanh toán online phải hoàn tất mới được giao
                if (paidOnline && !paymentCompleted) {
                    throw new BadRequestException("Đơn hàng chưa thanh toán nên không thể giao");
                }
                order.setOrderStatus(OrderStatus.SHIPPED);
                orderRepository.save(order);
            }
            case DELIVERED -> {
                order.setOrderStatus(OrderStatus.DELIVERED);
                // Thanh toán khi nhận hàng (COD): giao thành công thì coi như đã thu tiền
                if (order.getPaymentMethod() == PaymentMethod.CASH
                        && order.getPaymentStatus() == PaymentStatus.PENDING) {
                    order.setPaymentStatus(PaymentStatus.COMPLETED);
                }
                orderRepository.save(order);
            }
            default -> throw new BadRequestException("Trạng thái không hợp lệ");
        }
        return toResponseWithUser(order);
    }

    // Kèm thông tin người đặt (nếu có) để admin xem; thiếu thông tin thì trả về bản không có user
    private OrderResponse toResponseWithUser(Order order) {
        return userInformationRepository.findByUserId(order.getUser().getId())
                .map(info -> orderMapper.toOrderResponse(order, info))
                .orElseGet(() -> orderMapper.toOrderResponse(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đã hoàn kho trước đó");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Đơn hàng không thể hủy");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        // Hoàn trả số lượng
        orderItems.forEach(item -> inventoryService.increaseStock(
                item.getProduct().getId(),
                item.getQuantity()
        ));
        orderRepository.save(order);
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, CancelOrderRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đã hoàn kho trước đó");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Đơn hàng không thể hủy");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        // Hoàn trả số lượng
        orderItems.forEach(item -> inventoryService.increaseStock(
                item.getProduct().getId(),
                item.getQuantity()
        ));
        // Xử lý khi thanh toán qua credit card
        if (order.getPaymentMethod() == PaymentMethod.CREDIT_CARD) {
            Transaction transaction = transactionRepository.findByOrderIdAndUser(id, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại"));
            transaction.setStatus(PaymentLinkStatus.CANCELLED);
            checkoutService.refund(transaction, request);
        }
        orderRepository.save(order);
        return orderMapper.toOrderResponse(order);
    }
}