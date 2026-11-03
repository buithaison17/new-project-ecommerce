package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId")
    Optional<Inventory> findByProductId(@Param("productId") Long productId);

    /** Khóa dòng (SELECT ... FOR UPDATE) để trừ/cộng kho an toàn khi nhiều request đồng thời. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId")
    Optional<Inventory> findByProductIdForUpdate(@Param("productId") Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.product.id IN :productIds")
    List<Inventory> findByProductIdIn(@Param("productIds") Collection<Long> productIds);

    @Query(value = "SELECT i FROM Inventory i JOIN i.product p WHERE p.isDeleted = false ORDER BY p.name ASC",
            countQuery = "SELECT COUNT(i) FROM Inventory i JOIN i.product p WHERE p.isDeleted = false")
    Page<Inventory> findAllOfActiveProducts(Pageable pageable);

    @Query(value = "SELECT i FROM Inventory i JOIN i.product p WHERE p.isDeleted = false "
            + "AND (i.quantity - i.reservedQuantity) < :threshold "
            + "ORDER BY (i.quantity - i.reservedQuantity) ASC, p.name ASC",
            countQuery = "SELECT COUNT(i) FROM Inventory i JOIN i.product p WHERE p.isDeleted = false "
                    + "AND (i.quantity - i.reservedQuantity) < :threshold")
    Page<Inventory> findLowStock(@Param("threshold") int threshold, Pageable pageable);
}
