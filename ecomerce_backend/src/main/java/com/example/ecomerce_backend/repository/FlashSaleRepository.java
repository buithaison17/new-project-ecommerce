package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long>, JpaSpecificationExecutor<FlashSale> {
    Optional<FlashSale> findByIdAndIsDeletedFalse(Long id);

    List<FlashSale> findByIsDeletedFalseAndIsActiveTrueOrderByStartAtAsc();
}
