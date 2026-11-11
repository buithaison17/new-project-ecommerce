package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.model.dto.response.AiCancelOrderResponse;
import com.example.ecomerce_backend.model.dto.response.AiDeliveryAddressResponse;
import com.example.ecomerce_backend.model.dto.response.AiOrderDetailResponse;
import com.example.ecomerce_backend.model.dto.response.AiOrderSummaryResponse;
import com.example.ecomerce_backend.model.dto.response.AiPlaceOrderResponse;
import com.example.ecomerce_backend.model.entity.User;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

import java.util.List;

/**
 * Các tool AI hỗ trợ khách hàng đặt hàng, xem đơn hàng và hủy đơn.
 * Được khởi tạo theo từng request với user hiện tại để đảm bảo dữ liệu đúng người dùng.
 */
public class OrderTools {

    private final User user;
    private final AiOrderService aiOrderService;

    public OrderTools(User user, AiOrderService aiOrderService) {
        this.user = user;
        this.aiOrderService = aiOrderService;
    }

    @Tool(description = "Lấy danh sách đơn hàng của khách hàng hiện tại. "
            + "Có thể lọc theo trạng thái: PENDING, SHIPPED, DELIVERED, CANCELLED. "
            + "Trả về id, trạng thái, phương thức thanh toán, tổng tiền, thời gian tạo, số sản phẩm.")
    public List<AiOrderSummaryResponse> getMyOrders(
            @ToolParam(description = "Trạng thái đơn hàng (PENDING/SHIPPED/DELIVERED/CANCELLED), để trống để lấy tất cả") String status,
            @ToolParam(description = "Số trang (bắt đầu từ 1, mặc định 1)") int page,
            @ToolParam(description = "Số đơn mỗi trang (mặc định 10, tối đa 20)") int size
    ) {
        return aiOrderService.getMyOrders(user, status, page, size);
    }

    @Tool(description = "Xem chi tiết một đơn hàng của khách hàng hiện tại theo ID. "
            + "Trả về trạng thái, thanh toán, địa chỉ giao hàng, danh sách sản phẩm.")
    public AiOrderDetailResponse getOrderDetail(
            @ToolParam(description = "ID đơn hàng") Long orderId
    ) {
        return aiOrderService.getOrderDetail(user, orderId);
    }

    @Tool(description = "Tạo đơn hàng mới cho khách hàng hiện tại. "
            + "Cần danh sách sản phẩm (productId, quantity), deliveryId (lấy từ getDeliveryAddresses), "
            + "paymentMethod (CASH hoặc CREDIT_CARD), ghi chú. "
            + "Nếu CREDIT_CARD sẽ trả về link thanh toán để khách hàng hoàn tất.")
    public AiPlaceOrderResponse placeOrder(
            @ToolParam(description = "Danh sách sản phẩm dạng JSON array, mỗi phần tử có productId (Long) và quantity (Integer). "
                    + "Ví dụ: [{\"productId\":1,\"quantity\":2}]") String itemsJson,
            @ToolParam(description = "ID địa chỉ giao hàng") Long deliveryId,
            @ToolParam(description = "Phương thức thanh toán: CASH (thanh toán khi nhận hàng) hoặc CREDIT_CARD (thanh toán online)") String paymentMethod,
            @ToolParam(description = "Ghi chú đơn hàng (có thể để trống)") String note
    ) {
        return aiOrderService.placeOrder(user, itemsJson, deliveryId, paymentMethod, note);
    }

    @Tool(description = "Hủy đơn hàng đang ở trạng thái PENDING của khách hàng hiện tại. "
            + "Chỉ hủy được đơn PENDING. Với đơn thanh toán online chưa thanh toán sẽ hủy link thanh toán; "
            + "với đơn đã thanh toán online cần cung cấp bin và accountNumber để hoàn tiền.")
    public AiCancelOrderResponse cancelOrder(
            @ToolParam(description = "ID đơn hàng cần hủy") Long orderId,
            @ToolParam(description = "Mã BIN ngân hàng nhận hoàn tiền (chỉ cần khi đơn đã thanh toán online)") String bin,
            @ToolParam(description = "Số tài khoản nhận hoàn tiền (chỉ cần khi đơn đã thanh toán online)") String accountNumber
    ) {
        return aiOrderService.cancelOrder(user, orderId, bin, accountNumber);
    }

    @Tool(description = "Lấy danh sách địa chỉ giao hàng đã lưu của khách hàng hiện tại. "
            + "Trả về id, địa chỉ, số điện thoại. Dùng trước khi đặt hàng để chọn deliveryId.")
    public List<AiDeliveryAddressResponse> getDeliveryAddresses() {
        return aiOrderService.getDeliveryAddresses(user);
    }

    @Tool(description = "Thêm địa chỉ giao hàng mới cho khách hàng hiện tại. "
            + "Cần address và phoneNumber (10 số). Trả về id địa chỉ vừa tạo để dùng khi đặt hàng.")
    public AiDeliveryAddressResponse createDeliveryAddress(
            @ToolParam(description = "Địa chỉ giao hàng đầy đủ") String address,
            @ToolParam(description = "Số điện thoại (10 số)") String phoneNumber
    ) {
        return aiOrderService.createDeliveryAddress(user, address, phoneNumber);
    }
}
