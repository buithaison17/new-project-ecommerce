package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserDelivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeliveryRepository extends JpaRepository<UserDelivery, Long> {
    List<UserDelivery> findByUser(User user);

    Optional<UserDelivery> findByIdAndUser(Long id, User user);

    Page<UserDelivery> findByUser(User user, Pageable pageable);
}
