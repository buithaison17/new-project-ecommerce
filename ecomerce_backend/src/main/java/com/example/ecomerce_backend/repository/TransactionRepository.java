package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.Transaction;
import com.example.ecomerce_backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByOrderCode(Long orderCode);

    Optional<Transaction> findByOrderId(Long orderId);

    Optional<Transaction> findByOrderIdAndUser(Long orderId, User user);

    @Query("SELECT t FROM Transaction t " +
           "WHERE t.order.paymentMethod = 'CREDIT_CARD' " +
           "AND t.order.orderStatus = 'PENDING' " +
           "AND t.order.paymentStatus = 'PENDING' " +
           "AND t.expiredAt IS NOT NULL " +
           "AND t.expiredAt < :now " +
           "AND t.order.isDeleted = false")
    List<Transaction> findExpiredTransactions(java.time.LocalDateTime now);
}
