package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
}
