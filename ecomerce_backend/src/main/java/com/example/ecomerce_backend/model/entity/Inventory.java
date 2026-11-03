package com.example.ecomerce_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(nullable = false, unique = true)
    private Product product;
    @Column(nullable = false)
    private Integer quantity;
    @Column(nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;
    // Optimistic lock: chặn ghi đè khi 2 admin cùng cập nhật kho
    @Version
    private Long version;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Số lượng khả dụng để bán = tồn thực tế - số đang giữ chỗ. */
    public int availableQuantity() {
        return quantity - reservedQuantity;
    }
}
