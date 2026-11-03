package com.example.ecomerce_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(nullable = false)
    private Product product;
    @Column(length = 500)
    private String url;
    @Builder.Default
    private Boolean isDeleted = false;
}
