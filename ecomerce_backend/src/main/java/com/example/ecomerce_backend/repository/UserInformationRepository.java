package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserInformationRepository extends JpaRepository<UserInformation, Long> {
    Optional<UserInformation> findByUserId(Long userId);

    boolean existsByUser(User user);
}
