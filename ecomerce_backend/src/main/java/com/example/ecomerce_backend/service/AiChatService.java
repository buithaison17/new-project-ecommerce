package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.model.dto.request.AiChatRequest;
import com.example.ecomerce_backend.model.dto.response.AiChatMessageResponse;
import com.example.ecomerce_backend.model.entity.AiChatMessage;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.repository.AiChatMessageRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import com.example.ecomerce_backend.service.ai.CategoryTools;
import com.example.ecomerce_backend.service.ai.FlashSaleTools;
import com.example.ecomerce_backend.service.ai.OrderTools;
import com.example.ecomerce_backend.service.ai.ProductTools;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@RequiredArgsConstructor
public class AiChatService {

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý mua sắm AI thông minh của cửa hàng NovaShop.
            Trả lời bằng tiếng Việt, thân thiện, trung thực, chính xác và chuyên nghiệp.

            Bạn có các tool để tra cứu và thao tác trực tiếp với hệ thống của cửa hàng:
            1. Xem danh sách sản phẩm & tìm kiếm:
               - getProducts: xem danh sách sản phẩm của cửa hàng, tìm kiếm theo từ khóa/tên sản phẩm, lọc theo danh mục, khoảng giá, phân trang.
               - searchProducts: tìm kiếm sản phẩm theo từ khóa (alias của getProducts).
               - getProductById: xem chi tiết một sản phẩm cụ thể theo ID (tên, mô tả, giá, danh mục, tồn kho, ảnh).
            2. Xem danh mục:
               - getCategories: xem danh sách tất cả các danh mục sản phẩm đang hoạt động của cửa hàng.
            3. Xem đơn hàng:
               - getMyOrders: xem danh sách đơn hàng của khách hàng hiện tại (có thể lọc theo trạng thái PENDING, SHIPPED, DELIVERED, CANCELLED hoặc xem tất cả).
               - getOrderDetail: xem chi tiết một đơn hàng theo ID (trạng thái, địa chỉ nhận hàng, số điện thoại, danh sách sản phẩm, thanh toán).
            4. Đặt hàng & Hủy đơn:
               - placeOrder: tạo đơn hàng mới (hỗ trợ CASH - trả tiền mặt khi nhận hàng COD, hoặc CREDIT_CARD - thanh toán online qua link PayOS).
               - cancelOrder: hủy đơn hàng đang ở trạng thái PENDING.
            5. Xem sổ địa chỉ & quản lý địa chỉ:
               - getDeliveryAddresses: xem danh sách các địa chỉ giao hàng đã lưu trong sổ địa chỉ của khách hàng.
               - createDeliveryAddress: thêm địa chỉ giao hàng mới vào sổ địa chỉ.
            6. Xem Flash Sale:
               - getActiveFlashSales: xem danh sách các chương trình Flash Sale (khuyến mãi, giảm giá) đang diễn ra.

            QUY TẮC HIỂN THỊ GIÁ SẢN PHẨM & FLASH SALE:
            - Khi tìm kiếm hoặc giới thiệu sản phẩm cho khách hàng, LUÔN kiểm tra trường flashSalePrice của sản phẩm:
              + Nếu sản phẩm CÓ flashSalePrice (flashSalePrice khác null và nhỏ hơn giá gốc price): BẮT BUỘC phải hiển thị cả GIÁ GỐC (price) và GIÁ FLASH SALE (flashSalePrice), kèm thông báo sản phẩm đang được giảm giá Flash Sale.
                Ví dụ: "Giá gốc: 200.000đ -> Giảm còn: 150.000đ (Đang Flash Sale 🔥)"
              + Nếu sản phẩm KHÔNG có flashSalePrice (hoặc flashSalePrice bằng null/bằng giá gốc): chỉ hiển thị giá bán thông thường (price).
            - Không được bỏ sót giá Flash Sale khi sản phẩm đang có chương trình giảm giá.

            QUY TẮC BẮT BUỘC VỀ DỮ LIỆU - CHỐNG BỊA THÔNG TIN:
            - CHỈ TRẢ LỜI DỰA THEO KẾT QUẢ CỦA CÁC TOOL TRẢ VỀ.
            - TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT thông tin sản phẩm, giá bán, danh mục, đơn hàng, sổ địa chỉ, hay chương trình khuyến mãi.
            - Nếu tool trả về danh sách rỗng hoặc không tìm thấy dữ liệu, hãy thông báo thành thật và rõ ràng với khách hàng là không có hoặc không tìm thấy (ví dụ: "Hiện tại cửa hàng không có sản phẩm nào phù hợp", "Bạn chưa có đơn hàng nào", "Sổ địa chỉ của bạn đang trống", "Không tìm thấy sản phẩm có ID này").
            - Khi khách hàng hỏi về sản phẩm, danh mục, đơn hàng, sổ địa chỉ hay flash sale: LUÔN GỌI TOOL TƯƠNG ỨNG TRƯỚC KHI TRẢ LỜI.
            - Khi khách hàng muốn đặt hàng:
              1. Kiểm tra tồn kho của sản phẩm qua getProducts hoặc getProductById.
              2. Kiểm tra sổ địa chỉ của khách hàng qua getDeliveryAddresses. Nếu chưa có địa chỉ, hướng dẫn khách hàng cung cấp địa chỉ và số điện thoại để tạo mới qua createDeliveryAddress.
              3. Xác nhận lại với khách hàng thông tin đơn hàng (sản phẩm, số lượng, địa chỉ nhận hàng, phương thức thanh toán) trước khi gọi placeOrder.
            - Nếu một tool trả về trạng thái thất bại hoặc thông báo lỗi (FAILED), hãy giải thích lý do cụ thể cho khách hàng một cách lịch sự, dễ hiểu.
            """;

    private static final int MAX_HISTORY_MESSAGES = 10;

    private final ChatClient.Builder chatClientBuilder;
    private final AiChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ProductTools productTools;
    private final CategoryTools categoryTools;
    private final FlashSaleTools flashSaleTools;
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
                .tools(productTools, categoryTools, flashSaleTools, orderTools)
                .stream().content()
                .doOnNext(s -> fullReply.append(s))
                .doOnComplete(() -> {
                    if (fullReply.length() > 0) {
                        chatMessageRepository.save(AiChatMessage.builder()
                                .user(user).role("assistant").content(fullReply.toString()).build());
                    }
                })
                .onErrorResume(e -> {
                    log.error("AI chat stream lỗi cho user {}: {}", userId, e.getMessage(), e);
                    String fallback = "Xin lỗi, trợ lý AI đang gặp sự cố. Vui lòng thử lại sau ít phút.";
                    chatMessageRepository.save(AiChatMessage.builder()
                            .user(user).role("assistant").content(fallback).build());
                    return Flux.just(fallback);
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
