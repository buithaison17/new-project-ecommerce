package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.AiChatRequest;
import com.example.ecomerce_backend.model.dto.response.AiChatMessageResponse;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import com.example.ecomerce_backend.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.List;

/** Chat với AI (OpenRouter - Gemini), stream SSE. Yêu cầu đăng nhập. */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    /**
     * POST /api/v1/ai/chat
     * Trả về text/event-stream: mỗi chunk là một SSE event `data: <nội dung>`.
     * Body: {"message": "..."}
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiChatRequest request
    ) {
        return aiChatService.chatStream(principal.getUser().getId(), request);
    }

    @GetMapping("/history")
    public ResponseEntity<ApiDataResponse<List<AiChatMessageResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy lịch sử chat thành công",
                aiChatService.getHistory(principal.getUser().getId())));
    }
}
