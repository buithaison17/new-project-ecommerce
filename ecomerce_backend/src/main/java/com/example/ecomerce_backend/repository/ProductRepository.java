package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.isDeleted = false")
    Optional<Product> findActiveById(@Param("id") Long id);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.category.id = :categoryId AND p.isDeleted = false")
    boolean existsActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isDeleted = false")
    long countActive();
}