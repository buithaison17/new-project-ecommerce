package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;
import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.model.dto.request.CreateOrderItemRequest;
import com.example.ecomerce_backend.model.dto.request.CreateOrderRequest;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.entity.Role;
import com.example.ecomerce_backend.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiOrderServiceTest {

    @Mock
    private OrderService orderService;

    private AiOrderService aiOrderService;
    private User customer;

    @BeforeEach
    void setUp() {
        aiOrderService = new AiOrderService(orderService, null, null, null, null);
        customer = User.builder()
                .id(1L)
                .role(Role.builder().name("CUSTOMER").build())
                .build();
    }

    @Test
    void placeOrder_mergesDuplicateItemsBeforeCreatingOrder() {
        OrderResponse orderResponse = orderResponse();
        when(orderService.createOrder(eq(customer), any(CreateOrderRequest.class)))
                .thenReturn(orderResponse);

        aiOrderService.placeOrder(customer, List.of(
                new CreateOrderItemRequest(1L, 2),
                new CreateOrderItemRequest(2L, 1),
                new CreateOrderItemRequest(1L, 3)
        ), 10L, "cash", null);

        ArgumentCaptor<CreateOrderRequest> captor = ArgumentCaptor.forClass(CreateOrderRequest.class);
        org.mockito.Mockito.verify(orderService).createOrder(eq(customer), captor.capture());
        CreateOrderRequest request = captor.getValue();
        assertEquals(2, request.items().size());
        assertEquals(new CreateOrderItemRequest(1L, 5), request.items().get(0));
        assertEquals(new CreateOrderItemRequest(2L, 1), request.items().get(1));
        assertEquals("CASH", request.paymentMethod());
    }

    @Test
    void placeOrder_rejectsEmptyItems() {
        assertThrows(BadRequestException.class,
                () -> aiOrderService.placeOrder(customer, List.of(), 10L, "CASH", null));
    }

    @Test
    void placeOrder_rejectsNonPositiveQuantity() {
        assertThrows(BadRequestException.class,
                () -> aiOrderService.placeOrder(customer,
                        List.of(new CreateOrderItemRequest(1L, 0)), 10L, "CASH", null));
    }

    @Test
    void placeOrder_requiresDeliveryId() {
        assertThrows(BadRequestException.class,
                () -> aiOrderService.placeOrder(customer,
                        List.of(new CreateOrderItemRequest(1L, 1)), null, "CASH", null));
    }

    @Test
    void placeOrder_rejectsInvalidPaymentMethod() {
        assertThrows(BadRequestException.class,
                () -> aiOrderService.placeOrder(customer,
                        List.of(new CreateOrderItemRequest(1L, 1)), 10L, "PAYPAL", null));
    }

    @Test
    void placeOrder_rejectsNonCustomer() {
        User admin = User.builder()
                .id(2L)
                .role(Role.builder().name("ADMIN").build())
                .build();
        assertThrows(BadRequestException.class,
                () -> aiOrderService.placeOrder(admin,
                        List.of(new CreateOrderItemRequest(1L, 1)), 10L, "CASH", null));
    }

    private OrderResponse orderResponse() {
        return new OrderResponse(
                1L,
                null,
                BigDecimal.valueOf(100000),
                BigDecimal.valueOf(20000),
                BigDecimal.valueOf(120000),
                null,
                "PENDING",
                PaymentMethod.CASH,
                PaymentStatus.PENDING,
                null
        );
    }
}
