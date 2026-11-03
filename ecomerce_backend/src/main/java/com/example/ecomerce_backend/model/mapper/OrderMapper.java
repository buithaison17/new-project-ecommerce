package com.example.ecomerce_backend.model.mapper;

import com.example.ecomerce_backend.model.dto.response.OrderItemResponse;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.model.entity.OrderItem;
import com.example.ecomerce_backend.model.entity.UserInformation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {
        ProductMapper.class,
        UserMapper.class
})
public interface OrderMapper {
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    List<OrderItemResponse> toOrderItemResponseList(List<OrderItem> orderItems);

    OrderResponse toOrderResponse(Order order);

    @Mapping(source = "order.id", target = "id")
    @Mapping(source = "userInformation", target = "user")
    OrderResponse toOrderResponse(Order order, UserInformation userInformation);
}
