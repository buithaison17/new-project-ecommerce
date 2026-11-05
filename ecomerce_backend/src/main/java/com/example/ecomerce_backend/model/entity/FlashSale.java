package com.example.ecomerce_backend.model.entity;

import com.example.ecomerce_backend.constants.FlashSaleDiscountType;
import com.example.ecomerce_backend.constants.FlashSaleScope;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flash_sales")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FlashSale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 255)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlashSaleScope scope;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlashSaleDiscountType discountType;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;
    @Column(nullable = false)
    private LocalDateTime startAt;
    @Column(nullable = false)
    private LocalDateTime endAt;
    @Builder.Default
    private Boolean isActive = true;
    @Builder.Default
    private Boolean isDeleted = false;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
