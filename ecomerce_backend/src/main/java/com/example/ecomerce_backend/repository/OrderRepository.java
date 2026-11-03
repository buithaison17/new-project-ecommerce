package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.model.dto.response.OrderResponse;
import com.example.ecomerce_backend.model.entity.Order;
import com.example.ecomerce_backend.model.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
   Optional<Order> findByIdAndUser(Long id, User user);

    Page<Order> findByIsDeleted(Boolean isDeleted, Pageable pageable);

    Page<Order> findByIsDeletedAndOrderStatus(Boolean isDeleted, OrderStatus orderStatus, Pageable pageable);

    Page<Order> findByIsDeletedAndUser(Boolean isDeleted, User user, Pageable pageable);

    Page<Order> findByIsDeletedAndUserAndOrderStatus(Boolean isDeleted, User user, OrderStatus orderStatus, Pageable pageable);
    @EntityGraph(attributePaths = {"user", "delivery"})
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    /** SELECT ... FOR UPDATE: dùng khi đổi trạng thái đơn để hai request đồng thời không xử lý cùng một đơn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Order> findWithLockById(Long id);
}
