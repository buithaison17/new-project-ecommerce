package com.example.ecomerce_backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatMessageResponse {
    private Long id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
}
