package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.AiChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    List<AiChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
