package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.Transaction;
import com.example.ecomerce_backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByOrderCode(Long orderCode);

    Optional<Transaction> findByOrderId(Long orderId);

    Optional<Transaction> findByOrderIdAndUser(Long orderId, User user);
}
