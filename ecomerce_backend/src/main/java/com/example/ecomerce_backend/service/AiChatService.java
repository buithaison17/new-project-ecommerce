package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.model.dto.request.AiChatRequest;
import com.example.ecomerce_backend.model.dto.response.AiChatMessageResponse;
import com.example.ecomerce_backend.model.entity.AiChatMessage;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.repository.AiChatMessageRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý mua sắm AI của cửa hàng e-commerce NovaShop.
            Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, tập trung vào tư vấn sản phẩm,
            giá cả, chính sách mua hàng và hỗ trợ khách hàng.
            """;

    private static final int MAX_HISTORY_MESSAGES = 20;

    private final ChatClient.Builder chatClientBuilder;
    private final AiChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    /**
     * Stream câu trả lời của AI (dùng cho SSE). Lưu câu hỏi trước khi stream,
     * lưu câu trả lời sau khi stream hoàn tất.
     */
    public Flux<String> chatStream(Long userId, AiChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        List<Message> messages = buildPromptMessages(userId, request.getMessage());

        chatMessageRepository.save(AiChatMessage.builder()
                .user(user).role("user").content(request.getMessage()).build());

        StringBuilder fullReply = new StringBuilder();
        return chatClientBuilder.build().prompt(new Prompt(messages)).stream().content()
                .doOnNext(fullReply::append)
                .doOnComplete(() -> {
                    if (fullReply.length() > 0) {
                        chatMessageRepository.save(AiChatMessage.builder()
                                .user(user).role("assistant").content(fullReply.toString()).build());
                    }
                });
    }

    @Transactional(readOnly = true)
    public List<AiChatMessageResponse> getHistory(Long userId) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(m -> AiChatMessageResponse.builder()
                        .id(m.getId())
                        .role(m.getRole())
                        .content(m.getContent())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();
    }

    private List<Message> buildPromptMessages(Long userId, String currentMessage) {
        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(SYSTEM_PROMPT));

        List<AiChatMessage> recent = chatMessageRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_HISTORY_MESSAGES));
        Collections.reverse(recent);
        recent.forEach(m -> {
            if ("assistant".equals(m.getRole())) {
                messages.add(new AssistantMessage(m.getContent()));
            } else {
                messages.add(new UserMessage(m.getContent()));
            }
        });

        messages.add(new UserMessage(currentMessage));
        return messages;
    }
}
