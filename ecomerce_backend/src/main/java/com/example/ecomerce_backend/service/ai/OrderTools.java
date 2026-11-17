package com.example.ecomerce_backend.service.ai;

import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CreateOrderItemRequest;
import com.example.ecomerce_backend.model.dto.response.AiCancelOrderResponse;
import com.example.ecomerce_backend.model.dto.response.AiDeliveryAddressResponse;
import com.example.ecomerce_backend.model.dto.response.AiOrderSummaryResponse;
import com.example.ecomerce_backend.model.dto.response.AiPlaceOrderResponse;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.service.AiOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Các tool AI hỗ trợ xem đơn hàng, xem sổ địa chỉ, đặt hàng và hủy đơn.
 * Được khởi tạo theo từng request với user hiện tại để đảm bảo dữ liệu đúng người dùng.
 */
@Slf4j
public class OrderTools {

    private final User user;
    private final AiOrderService aiOrderService;

    public OrderTools(User user, AiOrderService aiOrderService) {
        this.user = user;
        this.aiOrderService = aiOrderService;
    }

    @Tool(description = "Xem danh sách đơn hàng của khách hàng hiện tại. "
            + "Có thể lọc theo trạng thái: PENDING, SHIPPED, DELIVERED, CANCELLED (hoặc để trống/ALL để lấy tất cả). "
            + "Trả về danh sách đơn hàng gồm id, trạng thái, phương thức thanh toán, tổng tiền, ngày tạo, số món.")
    public List<AiOrderSummaryResponse> getMyOrders(
            @ToolParam(description = "Trạng thái đơn hàng (PENDING/SHIPPED/DELIVERED/CANCELLED), để trống hoặc ALL để lấy tất cả") String status,
            @ToolParam(description = "Số trang (bắt đầu từ 1, mặc định 1)") Integer page,
            @ToolParam(description = "Số đơn mỗi trang (mặc định 10, tối đa 20)") Integer size
    ) {
        try {
            int safePage = (page == null || page <= 0) ? 1 : Math.min(page, 1000);
            int safeSize = (size == null || size <= 0) ? 10 : Math.min(size, 20);
            String safeStatus = normalizeOrderStatus(status);
            return aiOrderService.getMyOrders(user, safeStatus, safePage, safeSize);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đơn hàng: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Tool(description = "Xem chi tiết một đơn hàng của khách hàng hiện tại theo ID đơn hàng. "
            + "Trả về trạng thái đơn hàng, phương thức thanh toán, trạng thái thanh toán, "
            + "địa chỉ giao hàng, số điện thoại, và danh sách các sản phẩm kèm giá.")
    public Object getOrderDetail(
            @ToolParam(description = "ID đơn hàng cần xem chi tiết (số nguyên dương)") Long orderId
    ) {
        if (orderId == null || orderId <= 0) {
            return Map.of("success", false, "message", "ID đơn hàng không hợp lệ (phải là số nguyên dương)");
        }
        try {
            return aiOrderService.getOrderDetail(user, orderId);
        } catch (ResourceNotFoundException e) {
            return Map.of("success", false, "message", "Không tìm thấy đơn hàng có mã " + orderId + " hoặc đơn hàng không thuộc về bạn");
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết đơn hàng {}: {}", orderId, e.getMessage(), e);
            return Map.of("success", false, "message", "Không thể lấy thông tin đơn hàng: " + e.getMessage());
        }
    }

    @Tool(description = "Xem sổ địa chỉ: lấy danh sách các địa chỉ giao hàng đã lưu của khách hàng hiện tại. "
            + "Trả về danh sách địa chỉ kèm id, địa chỉ chi tiết, số điện thoại nhận hàng. "
            + "Dùng khi khách hàng muốn xem danh sách địa chỉ, xem sổ địa chỉ, hoặc chọn deliveryId trước khi đặt hàng.")
    public List<AiDeliveryAddressResponse> getDeliveryAddresses() {
        try {
            return aiOrderService.getDeliveryAddresses(user);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách địa chỉ giao hàng: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Tool(description = "Thêm địa chỉ giao hàng mới vào sổ địa chỉ cho khách hàng hiện tại. "
            + "Cần address (địa chỉ nhận hàng chi tiết) và phoneNumber (số điện thoại nhận hàng 10 số). "
            + "Trả về id địa chỉ vừa tạo để dùng khi đặt hàng.")
    public Object createDeliveryAddress(
            @ToolParam(description = "Địa chỉ nhận hàng đầy đủ") String address,
            @ToolParam(description = "Số điện thoại nhận hàng (10 số)") String phoneNumber
    ) {
        if (address == null || address.trim().isBlank()) {
            return Map.of("success", false, "message", "Địa chỉ giao hàng không được để trống");
        }
        String cleanAddress = address.trim();
        if (cleanAddress.length() < 5) {
            return Map.of("success", false, "message", "Địa chỉ giao hàng quá ngắn, vui lòng cung cấp địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện)");
        }
        if (cleanAddress.length() > 500) {
            cleanAddress = cleanAddress.substring(0, 500);
        }

        if (phoneNumber == null || phoneNumber.trim().isBlank()) {
            return Map.of("success", false, "message", "Số điện thoại nhận hàng không được để trống");
        }
        String cleanPhone = normalizePhoneNumber(phoneNumber);
        if (cleanPhone == null) {
            return Map.of("success", false, "message", "Số điện thoại không hợp lệ (phải gồm 10 chữ số bắt đầu bằng số 0, ví dụ: 0912345678)");
        }

        try {
            return aiOrderService.createDeliveryAddress(user, cleanAddress, cleanPhone);
        } catch (Exception e) {
            log.error("Lỗi khi thêm địa chỉ giao hàng: {}", e.getMessage(), e);
            return Map.of("success", false, "message", "Không thể tạo địa chỉ giao hàng: " + e.getMessage());
        }
    }

    @Tool(description = "Tạo đơn hàng mới (đặt hàng) cho khách hàng hiện tại. "
            + "Cần danh sách sản phẩm (items: mỗi phần tử có productId và quantity), "
            + "deliveryId (lấy từ getDeliveryAddresses), "
            + "paymentMethod (CASH: thanh toán khi nhận hàng/COD, hoặc CREDIT_CARD: thanh toán trực tuyến qua link), "
            + "và ghi chú đơn hàng note (có thể để trống). "
            + "Trước khi gọi placeOrder, luôn kiểm tra địa chỉ và xác nhận thông tin với khách hàng.")
    public AiPlaceOrderResponse placeOrder(
            @ToolParam(description = "Danh sách sản phẩm cần đặt. Mỗi phần tử gồm productId (Long) và quantity (Integer). Ví dụ: [{\"productId\":1,\"quantity\":2}]") List<CreateOrderItemRequest> items,
            @ToolParam(description = "ID địa chỉ giao hàng (số nguyên dương), lấy từ getDeliveryAddresses") Long deliveryId,
            @ToolParam(description = "Phương thức thanh toán: CASH (thanh toán khi nhận hàng/COD) hoặc CREDIT_CARD (thanh toán online)") String paymentMethod,
            @ToolParam(description = "Ghi chú đơn hàng (có thể để trống)") String note
    ) {
        // 1. Kiểm tra danh sách sản phẩm
        if (items == null || items.isEmpty()) {
            return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                    "Không thể tạo đơn hàng: Danh sách sản phẩm không được để trống");
        }
        for (CreateOrderItemRequest item : items) {
            if (item == null) {
                return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                        "Không thể tạo đơn hàng: Có sản phẩm trong danh sách bị trống (null)");
            }
            if (item.productId() == null || item.productId() <= 0) {
                return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                        "Không thể tạo đơn hàng: ID sản phẩm không hợp lệ (phải là số nguyên dương)");
            }
            if (item.quantity() == null || item.quantity() <= 0) {
                return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                        "Không thể tạo đơn hàng: Số lượng sản phẩm phải lớn hơn 0");
            }
            if (item.quantity() > 1000) {
                return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                        "Không thể tạo đơn hàng: Số lượng sản phẩm " + item.productId() + " vượt quá giới hạn đặt hàng (tối đa 1000)");
            }
        }

        // 2. Kiểm tra deliveryId
        if (deliveryId == null || deliveryId <= 0) {
            return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                    "Không thể tạo đơn hàng: Vui lòng chọn địa chỉ giao hàng hợp lệ từ sổ địa chỉ (deliveryId)");
        }

        // 3. Chuẩn hóa phương thức thanh toán
        String normalizedPayment = normalizePaymentMethod(paymentMethod);
        if (normalizedPayment == null) {
            return new AiPlaceOrderResponse(null, "FAILED", paymentMethod, null, null, null,
                    "Không thể tạo đơn hàng: Phương thức thanh toán '" + paymentMethod + "' không hợp lệ (hỗ trợ CASH hoặc CREDIT_CARD)");
        }

        // 4. Chuẩn hóa ghi chú
        String safeNote = note;
        if (safeNote != null) {
            safeNote = safeNote.trim();
            if (safeNote.length() > 500) {
                safeNote = safeNote.substring(0, 500);
            }
        }

        try {
            return aiOrderService.placeOrder(user, items, deliveryId, normalizedPayment, safeNote);
        } catch (Exception e) {
            log.error("Lỗi khi đặt hàng qua AI: {}", e.getMessage(), e);
            return new AiPlaceOrderResponse(
                    null,
                    "FAILED",
                    normalizedPayment,
                    null,
                    null,
                    null,
                    "Không thể tạo đơn hàng: " + e.getMessage()
            );
        }
    }

    @Tool(description = "Hủy đơn hàng đang ở trạng thái PENDING của khách hàng hiện tại. "
            + "Chỉ hủy được đơn PENDING. Với đơn online chưa thanh toán sẽ hủy link thanh toán; "
            + "với đơn đã thanh toán online cần cung cấp bin và accountNumber để hoàn tiền.")
    public AiCancelOrderResponse cancelOrder(
            @ToolParam(description = "ID đơn hàng cần hủy (số nguyên dương)") Long orderId,
            @ToolParam(description = "Mã BIN ngân hàng nhận hoàn tiền (chỉ cần khi đơn đã thanh toán online)") String bin,
            @ToolParam(description = "Số tài khoản nhận hoàn tiền (chỉ cần khi đơn đã thanh toán online)") String accountNumber
    ) {
        if (orderId == null || orderId <= 0) {
            return new AiCancelOrderResponse(null, "FAILED", "Vui lòng cung cấp ID đơn hàng hợp lệ (phải là số nguyên dương)");
        }
        String safeBin = bin != null ? bin.trim() : null;
        String safeAccount = accountNumber != null ? accountNumber.trim() : null;
        try {
            return aiOrderService.cancelOrder(user, orderId, safeBin, safeAccount);
        } catch (Exception e) {
            log.error("Lỗi khi hủy đơn hàng {}: {}", orderId, e.getMessage(), e);
            return new AiCancelOrderResponse(orderId, "FAILED", "Không thể hủy đơn hàng: " + e.getMessage());
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "CASH";
        }
        String clean = paymentMethod.trim().toUpperCase();
        if (clean.equals("CASH") || clean.equals("COD") || clean.contains("TIEN_MAT") || clean.contains("MAT")) {
            return "CASH";
        }
        if (clean.equals("CREDIT_CARD") || clean.contains("ONLINE") || clean.contains("PAYOS") || clean.contains("CARD") || clean.contains("CHUYEN_KHOAN")) {
            return "CREDIT_CARD";
        }
        return null;
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null) return null;
        String cleaned = phone.replaceAll("[\\s\\-\\.\\(\\)]", "");
        if (cleaned.startsWith("+84")) {
            cleaned = "0" + cleaned.substring(3);
        } else if (cleaned.startsWith("84") && cleaned.length() == 11) {
            cleaned = "0" + cleaned.substring(2);
        }
        if (cleaned.matches("^0[0-9]{9}$")) {
            return cleaned;
        }
        return null;
    }

    private String normalizeOrderStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String clean = status.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        if ("ALL".equals(clean) || "TAT_CA".equals(clean) || "TATCA".equals(clean)) {
            return null;
        }
        return clean;
    }
}
