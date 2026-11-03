package com.example.ecomerce_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_transactions")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private Long orderCode;
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    @Enumerated(EnumType.STRING)
    private PaymentLinkStatus status;
    @Column(nullable = false)
    private String paymentLinkId;
    private String reference;
    private String accountNumber;
    private String bankBin;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
