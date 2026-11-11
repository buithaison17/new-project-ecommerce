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

            Bạn có các tool để tra cứu dữ liệu thực tế của cửa hàng:
            - searchProducts: tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá.
            - getActiveFlashSales: xem các chương trình Flash Sale (giảm giá) đang chạy.
            - getMyOrders: xem danh sách đơn hàng của khách hàng.
            - getOrderDetail: xem chi tiết một đơn hàng.
            - placeOrder: tạo đơn hàng mới (COD hoặc thanh toán online).
            - cancelOrder: hủy đơn hàng đang PENDING.
            - getDeliveryAddresses: xem địa chỉ giao hàng đã lưu.
            - createDeliveryAddress: thêm địa chỉ giao hàng mới.

            Khi khách hàng hỏi về sản phẩm, giá cả, khuyến mãi, Flash Sale, hãy gọi tool
            tương ứng để lấy dữ liệu thật trước khi trả lời. Không tự bịa thông tin sản phẩm
            hoặc giá cả. Sau khi có kết quả, tóm tắt ngắn gọn và gợi ý sản phẩm phù hợp.

            Khi khách hàng muốn đặt hàng, kiểm tra giỏ hàng/địa chỉ/sản phẩm trước, xác nhận
            thông tin rồi mới gọi placeOrder. Khi khách hàng muốn xem hoặc hủy đơn, dùng
            getMyOrders/getOrderDetail/cancelOrder. Luôn hỏi rõ nếu thiếu thông tin cần thiết.
            """;

    private static final int MAX_HISTORY_MESSAGES = 20;

    private final ChatClient.Builder chatClientBuilder;
    private final AiChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CatalogTools catalogTools;
    private final AiOrderService aiOrderService;

    /**
     * Stream câu trả lời của AI (dùng cho SSE). Lưu câu hỏi trước khi stream,
     * lưu câu trả lời sau khi stream hoàn tất.
     */
    public Flux<String> chatStream(Long userId, AiChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        List<Message> messages = buildPromptMessages(userId, request.getMessage());
        OrderTools orderTools = new OrderTools(user, aiOrderService);

        chatMessageRepository.save(AiChatMessage.builder()
                .user(user).role("user").content(request.getMessage()).build());

        StringBuilder fullReply = new StringBuilder();
        return chatClientBuilder.build()
                .prompt(new Prompt(messages))
                .tools(catalogTools, orderTools)
                .stream().content()
                .doOnNext(s -> fullReply.append(s))
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
