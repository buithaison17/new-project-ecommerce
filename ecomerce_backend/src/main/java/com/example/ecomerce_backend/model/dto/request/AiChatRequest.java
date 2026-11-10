package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 4000, message = "Tin nhắn tối đa 4000 ký tự")
    private String message;
}
