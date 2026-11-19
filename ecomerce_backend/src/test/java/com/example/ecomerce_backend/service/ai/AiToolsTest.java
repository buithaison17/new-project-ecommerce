package com.example.ecomerce_backend.service.ai;

import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CreateOrderItemRequest;
import com.example.ecomerce_backend.model.dto.response.*;
import com.example.ecomerce_backend.model.entity.Role;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.tool.annotation.Tool;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiToolsTest {

    @Mock
    private ProductService productService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private FlashSaleService flashSaleService;

    @Mock
    private AiOrderService aiOrderService;

    private ProductTools productTools;
    private CategoryTools categoryTools;
    private FlashSaleTools flashSaleTools;
    private OrderTools orderTools;

    private User testCustomer;

    @BeforeEach
    void setUp() {
        productTools = new ProductTools(productService);
        categoryTools = new CategoryTools(categoryService);
        flashSaleTools = new FlashSaleTools(flashSaleService);

        testCustomer = User.builder()
                .id(1L)
                .email("customer@example.com")
                .role(Role.builder().name("CUSTOMER").build())
                .build();
        orderTools = new OrderTools(testCustomer, aiOrderService);
    }

    // =========================================================================
    // 1. Kiểm tra chú thích @Tool đầy đủ cho tất cả các tool theo yêu cầu
    // =========================================================================
    @Test
    @DisplayName("Tất cả các tool theo yêu cầu đều có chú thích @Tool hợp lệ")
    void verifyToolAnnotationsExist() throws NoSuchMethodException {
        // 1. Xem danh sách sản phẩm
        Method getProducts = ProductTools.class.getMethod("getProducts", String.class, Long.class, BigDecimal.class,
                BigDecimal.class, String.class, String.class, Integer.class, Integer.class);
        assertNotNull(getProducts.getAnnotation(Tool.class));

        Method searchProducts = ProductTools.class.getMethod("searchProducts", String.class, Long.class,
                BigDecimal.class, BigDecimal.class, String.class, String.class, Integer.class, Integer.class);
        assertNotNull(searchProducts.getAnnotation(Tool.class));

        Method getProductById = ProductTools.class.getMethod("getProductById", Long.class);
        assertNotNull(getProductById.getAnnotation(Tool.class));

        // 2. Xem danh mục
        Method getCategories = CategoryTools.class.getMethod("getCategories");
        assertNotNull(getCategories.getAnnotation(Tool.class));

        // 3. Xem Flash Sale
        Method getActiveFlashSales = FlashSaleTools.class.getMethod("getActiveFlashSales");
        assertNotNull(getActiveFlashSales.getAnnotation(Tool.class));

        // 4. Xem đơn hàng
        Method getMyOrders = OrderTools.class.getMethod("getMyOrders", String.class, Integer.class, Integer.class);
        assertNotNull(getMyOrders.getAnnotation(Tool.class));

        Method getOrderDetail = OrderTools.class.getMethod("getOrderDetail", Long.class);
        assertNotNull(getOrderDetail.getAnnotation(Tool.class));

        // 5. Xem sổ địa chỉ
        Method getDeliveryAddresses = OrderTools.class.getMethod("getDeliveryAddresses");
        assertNotNull(getDeliveryAddresses.getAnnotation(Tool.class));

        Method createDeliveryAddress = OrderTools.class.getMethod("createDeliveryAddress", String.class, String.class);
        assertNotNull(createDeliveryAddress.getAnnotation(Tool.class));

        // 6. Đặt hàng & Hủy đơn
        Method placeOrder = OrderTools.class.getMethod("placeOrder", List.class, Long.class, String.class,
                String.class);
        assertNotNull(placeOrder.getAnnotation(Tool.class));

        Method cancelOrder = OrderTools.class.getMethod("cancelOrder", Long.class, String.class, String.class);
        assertNotNull(cancelOrder.getAnnotation(Tool.class));
    }

    // =========================================================================
    // 2. ProductTools Tests
    // =========================================================================
    @Test
    @DisplayName("getProducts: thành công với các tham số chuẩn")
    void getProducts_success() {
        PageResponse<ProductSummaryResponse> expected = new PageResponse<>(
                List.of(new ProductSummaryResponse(1L, "Laptop", BigDecimal.valueOf(15000000), 1L, "Công nghệ",
                        "thumb.jpg", 10, true, null)),
                0, 12, 1L, 1);
        when(productService.search(eq("laptop"), eq(1L), any(), any(), eq("createdAt"), eq("desc"), eq(0), eq(12)))
                .thenReturn(expected);

        PageResponse<ProductSummaryResponse> result = productTools.getProducts("laptop", 1L, null, null, null, null,
                null, null);
        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertEquals("Laptop", result.content().get(0).name());
    }

    @Test
    @DisplayName("getProducts: tự hoán đổi nếu minPrice > maxPrice để không bị lỗi")
    void getProducts_swapsMinAndMaxPrice() {
        PageResponse<ProductSummaryResponse> empty = new PageResponse<>(List.of(), 0, 12, 0L, 0);
        when(productService.search(any(), any(), eq(BigDecimal.valueOf(100)), eq(BigDecimal.valueOf(500)), any(), any(),
                anyInt(), anyInt()))
                .thenReturn(empty);

        // Truyền min = 500, max = 100 -> tool phải tự đổi thành min = 100, max = 500
        PageResponse<ProductSummaryResponse> result = productTools.getProducts(null, null, BigDecimal.valueOf(500),
                BigDecimal.valueOf(100), null, null, 0, 10);
        assertNotNull(result);
        verify(productService).search(any(), any(), eq(BigDecimal.valueOf(100)), eq(BigDecimal.valueOf(500)), any(),
                any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("getProducts: khi service ném lỗi thì bắt lỗi và trả về PageResponse rỗng, không crash")
    void getProducts_handlesServiceException() {
        when(productService.search(any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenThrow(new RuntimeException("Database error"));

        PageResponse<ProductSummaryResponse> result = productTools.getProducts("error", null, null, null, null, null, 0,
                10);
        assertNotNull(result);
        assertTrue(result.content().isEmpty());
        assertEquals(0, result.totalElements());
    }

    @Test
    @DisplayName("searchProducts: gọi getProducts thành công")
    void searchProducts_delegatesToGetProducts() {
        PageResponse<ProductSummaryResponse> expected = new PageResponse<>(List.of(), 0, 12, 0L, 0);
        when(productService.search(eq("sách"), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(expected);

        PageResponse<ProductSummaryResponse> result = productTools.searchProducts("sách", null, null, null, null, null,
                null, null);
        assertNotNull(result);
        verify(productService).search(eq("sách"), any(), any(), any(), any(), any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("getProducts: trả về cả giá gốc và giá flash sale khi sản phẩm đang được sale")
    void getProducts_includesFlashSalePriceWhenOnSale() {
        BigDecimal originalPrice = BigDecimal.valueOf(200000);
        BigDecimal flashSalePrice = BigDecimal.valueOf(150000);
        ProductSummaryResponse saleItem = new ProductSummaryResponse(1L, "Áo Thun Nam", originalPrice, 1L, "Thời trang",
                "thumb.jpg", 20, true, flashSalePrice);
        PageResponse<ProductSummaryResponse> expected = new PageResponse<>(
                List.of(saleItem), 0, 12, 1L, 1);
        when(productService.search(any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(expected);

        PageResponse<ProductSummaryResponse> result = productTools.getProducts("áo thun", null, null, null, null, null, null, null);
        assertNotNull(result);
        assertEquals(1, result.content().size());
        ProductSummaryResponse item = result.content().get(0);

        // Kiểm tra chắc chắn hiển thị được cả giá gốc và giá flash sale
        assertEquals(originalPrice, item.price());
        assertEquals(originalPrice, item.getOriginalPrice());
        assertEquals(flashSalePrice, item.flashSalePrice());
        assertTrue(item.getHasFlashSale());
        assertTrue(item.getPriceDisplay().contains("Giá gốc"));
        assertTrue(item.getPriceDisplay().contains("Giá Flash Sale"));
    }

    @Test
    @DisplayName("getProducts: sản phẩm không sale thì hasFlashSale=false và chỉ hiển thị giá thường")
    void getProducts_withoutFlashSale() {
        BigDecimal originalPrice = BigDecimal.valueOf(200000);
        ProductSummaryResponse normalItem = new ProductSummaryResponse(2L, "Quần Jean", originalPrice, 1L, "Thời trang",
                "thumb.jpg", 10, true, null);
        PageResponse<ProductSummaryResponse> expected = new PageResponse<>(
                List.of(normalItem), 0, 12, 1L, 1);
        when(productService.search(any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(expected);

        PageResponse<ProductSummaryResponse> result = productTools.getProducts("quần jean", null, null, null, null, null, null, null);
        assertNotNull(result);
        ProductSummaryResponse item = result.content().get(0);
        assertEquals(originalPrice, item.price());
        assertNull(item.flashSalePrice());
        assertFalse(item.getHasFlashSale());
        assertFalse(item.getPriceDisplay().contains("Flash Sale"));
    }

    @Test
    @DisplayName("getProductById: thành công khi tìm thấy sản phẩm có cả giá gốc và flash sale")
    void getProductById_found() {
        ProductResponse response = new ProductResponse(1L, "Sách Tâm Lý", "Mô tả", BigDecimal.valueOf(100000),
                null, "thumb.jpg", List.of(), 5, true, LocalDateTime.now(), LocalDateTime.now(), BigDecimal.valueOf(80000));
        when(productService.getById(1L)).thenReturn(response);

        Object result = productTools.getProductById(1L);
        assertInstanceOf(ProductResponse.class, result);
        ProductResponse res = (ProductResponse) result;
        assertEquals("Sách Tâm Lý", res.name());
        assertEquals(BigDecimal.valueOf(100000), res.price());
        assertEquals(BigDecimal.valueOf(100000), res.getOriginalPrice());
        assertEquals(BigDecimal.valueOf(80000), res.flashSalePrice());
        assertTrue(res.getHasFlashSale());
        assertTrue(res.getPriceDisplay().contains("Giá gốc"));
        assertTrue(res.getPriceDisplay().contains("Giá Flash Sale"));
    }

    @Test
    @DisplayName("getProductById: trả về thông báo lỗi thân thiện khi không tìm thấy, không ném exception")
    void getProductById_notFound() {
        when(productService.getById(999L)).thenThrow(new ResourceNotFoundException("Sản phẩm không tồn tại"));

        Object result = productTools.getProductById(999L);
        assertInstanceOf(Map.class, result);
        Map<?, ?> map = (Map<?, ?>) result;
        assertEquals(false, map.get("found"));
        assertTrue(map.get("message").toString().contains("999"));
    }

    @Test
    @DisplayName("getProductById: xử lý an toàn khi productId là null")
    void getProductById_nullId() {
        Object result = productTools.getProductById(null);
        assertInstanceOf(Map.class, result);
        Map<?, ?> map = (Map<?, ?>) result;
        assertEquals(false, map.get("found"));
    }

    // =========================================================================
    // 3. CategoryTools Tests
    // =========================================================================
    @Test
    @DisplayName("getCategories: trả về danh sách danh mục thành công")
    void getCategories_success() {
        when(categoryService.getAll()).thenReturn(List.of(
                new CategoryResponse(1L, "Thời trang", "Quần áo")));

        List<CategoryResponse> result = categoryTools.getCategories();
        assertEquals(1, result.size());
        assertEquals("Thời trang", result.get(0).name());
    }

    @Test
    @DisplayName("getCategories: khi lỗi service thì bắt lỗi trả về danh sách rỗng")
    void getCategories_handlesException() {
        when(categoryService.getAll()).thenThrow(new RuntimeException("DB Connection timeout"));

        List<CategoryResponse> result = categoryTools.getCategories();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // =========================================================================
    // 4. FlashSaleTools Tests
    // =========================================================================
    @Test
    @DisplayName("getActiveFlashSales: trả về danh sách flash sale đang chạy")
    void getActiveFlashSales_success() {
        when(flashSaleService.getActive()).thenReturn(List.of(
                new FlashSaleResponse(1L, "Sale hè", "Giảm 20%", "ALL", null, null, null, null, "PERCENTAGE",
                        BigDecimal.valueOf(20), LocalDateTime.now(), LocalDateTime.now().plusDays(1), true, true,
                        LocalDateTime.now(), LocalDateTime.now())));

        List<FlashSaleResponse> result = flashSaleTools.getActiveFlashSales();
        assertEquals(1, result.size());
        assertEquals("Sale hè", result.get(0).name());
    }

    @Test
    @DisplayName("getActiveFlashSales: khi lỗi service thì bắt lỗi trả về danh sách rỗng")
    void getActiveFlashSales_handlesException() {
        when(flashSaleService.getActive()).thenThrow(new RuntimeException("Redis error"));

        List<FlashSaleResponse> result = flashSaleTools.getActiveFlashSales();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // =========================================================================
    // 5. OrderTools Tests (Xem đơn hàng, xem sổ địa chỉ, đặt hàng, hủy đơn)
    // =========================================================================
    @Test
    @DisplayName("getMyOrders: thành công khi lấy danh sách đơn")
    void getMyOrders_success() {
        when(aiOrderService.getMyOrders(eq(testCustomer), eq("PENDING"), anyInt(), anyInt()))
                .thenReturn(List.of(new AiOrderSummaryResponse(10L, "PENDING", "CASH", "PENDING",
                        BigDecimal.valueOf(50000), LocalDateTime.now(), 1)));

        List<AiOrderSummaryResponse> result = orderTools.getMyOrders("PENDING", 1, 10);
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).id());
    }

    @Test
    @DisplayName("getMyOrders: khi service lỗi thì bắt lỗi trả về danh sách rỗng")
    void getMyOrders_handlesException() {
        when(aiOrderService.getMyOrders(any(), any(), anyInt(), anyInt()))
                .thenThrow(new RuntimeException("Order service error"));

        List<AiOrderSummaryResponse> result = orderTools.getMyOrders(null, 1, 10);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("getOrderDetail: thành công khi tìm thấy đơn hàng")
    void getOrderDetail_success() {
        AiOrderDetailResponse detail = new AiOrderDetailResponse(
                10L, "PENDING", "CASH", "PENDING", BigDecimal.valueOf(100000), BigDecimal.valueOf(20000),
                BigDecimal.valueOf(120000), "Giao nhanh", LocalDateTime.now(), "123 Đường A", "0901234567", List.of());
        when(aiOrderService.getOrderDetail(testCustomer, 10L)).thenReturn(detail);

        Object result = orderTools.getOrderDetail(10L);
        assertInstanceOf(AiOrderDetailResponse.class, result);
        assertEquals(10L, ((AiOrderDetailResponse) result).id());
    }

    @Test
    @DisplayName("getOrderDetail: trả về thông báo lỗi an toàn khi orderId không tồn tại")
    void getOrderDetail_notFound() {
        when(aiOrderService.getOrderDetail(testCustomer, 999L))
                .thenThrow(new ResourceNotFoundException("Đơn hàng không tồn tại"));

        Object result = orderTools.getOrderDetail(999L);
        assertInstanceOf(Map.class, result);
        Map<?, ?> map = (Map<?, ?>) result;
        assertEquals(false, map.get("success"));
        assertTrue(map.get("message").toString().contains("999"));
    }

    @Test
    @DisplayName("getOrderDetail: xử lý an toàn khi orderId là null")
    void getOrderDetail_nullId() {
        Object result = orderTools.getOrderDetail(null);
        assertInstanceOf(Map.class, result);
        Map<?, ?> map = (Map<?, ?>) result;
        assertEquals(false, map.get("success"));
    }

    @Test
    @DisplayName("getDeliveryAddresses: lấy danh sách sổ địa chỉ thành công")
    void getDeliveryAddresses_success() {
        when(aiOrderService.getDeliveryAddresses(testCustomer)).thenReturn(List.of(
                new AiDeliveryAddressResponse(5L, "Số 1 Cầu Giấy, Hà Nội", "0988888888")));

        List<AiDeliveryAddressResponse> result = orderTools.getDeliveryAddresses();
        assertEquals(1, result.size());
        assertEquals("Số 1 Cầu Giấy, Hà Nội", result.get(0).address());
    }

    @Test
    @DisplayName("getDeliveryAddresses: xử lý an toàn khi service lỗi")
    void getDeliveryAddresses_handlesException() {
        when(aiOrderService.getDeliveryAddresses(testCustomer)).thenThrow(new RuntimeException("DB error"));

        List<AiDeliveryAddressResponse> result = orderTools.getDeliveryAddresses();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("createDeliveryAddress: tạo địa chỉ mới thành công")
    void createDeliveryAddress_success() {
        when(aiOrderService.createDeliveryAddress(testCustomer, "Số 10 Nguyễn Huệ, TP.HCM", "0912345678"))
                .thenReturn(new AiDeliveryAddressResponse(6L, "Số 10 Nguyễn Huệ, TP.HCM", "0912345678"));

        Object result = orderTools.createDeliveryAddress("Số 10 Nguyễn Huệ, TP.HCM", "0912345678");
        assertInstanceOf(AiDeliveryAddressResponse.class, result);
        assertEquals(6L, ((AiDeliveryAddressResponse) result).id());
    }

    @Test
    @DisplayName("createDeliveryAddress: kiểm tra đầu vào rỗng trả về lỗi, không ném exception")
    void createDeliveryAddress_validation() {
        Object emptyAddress = orderTools.createDeliveryAddress("", "0912345678");
        assertInstanceOf(Map.class, emptyAddress);
        assertEquals(false, ((Map<?, ?>) emptyAddress).get("success"));

        Object emptyPhone = orderTools.createDeliveryAddress("123 Phố", null);
        assertInstanceOf(Map.class, emptyPhone);
        assertEquals(false, ((Map<?, ?>) emptyPhone).get("success"));
    }

    @Test
    @DisplayName("placeOrder: đặt hàng thành công trả về kết quả")
    void placeOrder_success() {
        AiPlaceOrderResponse orderResponse = new AiPlaceOrderResponse(
                100L, "PENDING", "CASH", "PENDING", BigDecimal.valueOf(220000), null, "Đặt hàng thành công");
        when(aiOrderService.placeOrder(eq(testCustomer), anyList(), eq(5L), eq("CASH"), any()))
                .thenReturn(orderResponse);

        AiPlaceOrderResponse result = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 2)), 5L, "CASH", "Giao ban ngày");
        assertNotNull(result);
        assertEquals(100L, result.orderId());
        assertEquals("PENDING", result.orderStatus());
    }

    @Test
    @DisplayName("placeOrder: khi có lỗi nghiệp vụ (hết hàng, sai địa chỉ) thì trả về FAILED có thông điệp rõ ràng, không crash")
    void placeOrder_handlesFailureGracefully() {
        when(aiOrderService.placeOrder(eq(testCustomer), anyList(), any(), any(), any()))
                .thenThrow(new BadRequestException("Sản phẩm 'Laptop' không đủ hàng tồn kho"));

        AiPlaceOrderResponse result = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 100)), 5L, "CASH", null);
        assertNotNull(result);
        assertNull(result.orderId());
        assertEquals("FAILED", result.orderStatus());
        assertTrue(result.message().contains("không đủ hàng tồn kho"));
    }

    @Test
    @DisplayName("cancelOrder: hủy đơn thành công")
    void cancelOrder_success() {
        when(aiOrderService.cancelOrder(testCustomer, 100L, null, null))
                .thenReturn(new AiCancelOrderResponse(100L, "CANCELLED", "Đã hủy đơn hàng thành công"));

        AiCancelOrderResponse result = orderTools.cancelOrder(100L, null, null);
        assertNotNull(result);
        assertEquals("CANCELLED", result.orderStatus());
    }

    @Test
    @DisplayName("cancelOrder: khi có lỗi thì trả về FAILED có thông điệp, không crash")
    void cancelOrder_handlesFailureGracefully() {
        when(aiOrderService.cancelOrder(eq(testCustomer), eq(100L), any(), any()))
                .thenThrow(new BadRequestException("Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING"));

        AiCancelOrderResponse result = orderTools.cancelOrder(100L, null, null);
        assertNotNull(result);
        assertEquals("FAILED", result.orderStatus());
        assertTrue(result.message().contains("PENDING"));
    }

    @Test
    @DisplayName("cancelOrder: xử lý an toàn khi orderId là null")
    void cancelOrder_nullId() {
        AiCancelOrderResponse result = orderTools.cancelOrder(null, null, null);
        assertNotNull(result);
        assertEquals("FAILED", result.orderStatus());
        assertTrue(result.message().contains("ID đơn hàng"));
    }

    // =========================================================================
    // 6. Kiểm thử xử lý biên và tham số sai (Boundary & Invalid Parameters)
    // =========================================================================
    @Test
    @DisplayName("ProductTools: xử lý biên an toàn cho getProducts (page âm, size vượt quá, sortBy sai, categoryId <= 0)")
    void getProducts_boundaryParameters() {
        PageResponse<ProductSummaryResponse> empty = new PageResponse<>(List.of(), 0, 12, 0L, 0);
        when(productService.search(any(), isNull(), eq(BigDecimal.ZERO), isNull(), eq("createdAt"), eq("desc"), eq(0),
                eq(50)))
                .thenReturn(empty);

        // page âm (-10) -> 0
        // size vượt ngưỡng (999) -> 50
        // minPrice âm (-100) -> 0
        // maxPrice âm (-50) -> null
        // categoryId <= 0 (-5) -> null
        // sortBy không hợp lệ ("DROP TABLE") -> "createdAt"
        // sortDir không hợp lệ ("UNKNOWN") -> "desc"
        // keyword toàn khoảng trắng (" ") -> null
        PageResponse<ProductSummaryResponse> result = productTools.getProducts(
                "   ", -5L, BigDecimal.valueOf(-100), BigDecimal.valueOf(-50),
                "DROP TABLE", "UNKNOWN", -10, 999);
        assertNotNull(result);
        verify(productService).search(isNull(), isNull(), eq(BigDecimal.ZERO), isNull(), eq("createdAt"), eq("desc"),
                eq(0), eq(50));
    }

    @Test
    @DisplayName("ProductTools: getProductById từ chối ID <= 0")
    void getProductById_invalidBoundaryIds() {
        Object zeroResult = productTools.getProductById(0L);
        assertInstanceOf(Map.class, zeroResult);
        assertEquals(false, ((Map<?, ?>) zeroResult).get("found"));

        Object negativeResult = productTools.getProductById(-99L);
        assertInstanceOf(Map.class, negativeResult);
        assertEquals(false, ((Map<?, ?>) negativeResult).get("found"));
    }

    @Test
    @DisplayName("OrderTools: getMyOrders xử lý biên page âm, size vượt giới hạn, status=ALL an toàn")
    void getMyOrders_boundaryParameters() {
        when(aiOrderService.getMyOrders(eq(testCustomer), isNull(), eq(1), eq(20)))
                .thenReturn(List.of());

        // page âm (-5) -> 1
        // size vượt (100) -> 20
        // status = "ALL" -> null (lấy tất cả)
        List<AiOrderSummaryResponse> result = orderTools.getMyOrders("ALL", -5, 100);
        assertNotNull(result);
        verify(aiOrderService).getMyOrders(eq(testCustomer), isNull(), eq(1), eq(20));
    }

    @Test
    @DisplayName("OrderTools: getOrderDetail từ chối orderId <= 0")
    void getOrderDetail_invalidBoundaryIds() {
        Object zeroResult = orderTools.getOrderDetail(0L);
        assertInstanceOf(Map.class, zeroResult);
        assertEquals(false, ((Map<?, ?>) zeroResult).get("success"));

        Object negativeResult = orderTools.getOrderDetail(-10L);
        assertInstanceOf(Map.class, negativeResult);
        assertEquals(false, ((Map<?, ?>) negativeResult).get("success"));
    }

    @Test
    @DisplayName("OrderTools: createDeliveryAddress kiểm tra số điện thoại và địa chỉ quá ngắn")
    void createDeliveryAddress_boundaryValidations() {
        // Địa chỉ quá ngắn (< 5 ký tự)
        Object shortAddress = orderTools.createDeliveryAddress("123", "0912345678");
        assertInstanceOf(Map.class, shortAddress);
        assertEquals(false, ((Map<?, ?>) shortAddress).get("success"));
        assertTrue(((Map<?, ?>) shortAddress).get("message").toString().contains("ngắn"));

        // Số điện thoại không đủ 10 số
        Object shortPhone = orderTools.createDeliveryAddress("Số 10 Phố Huế, Hà Nội", "09123");
        assertInstanceOf(Map.class, shortPhone);
        assertEquals(false, ((Map<?, ?>) shortPhone).get("success"));
        assertTrue(((Map<?, ?>) shortPhone).get("message").toString().contains("Số điện thoại không hợp lệ"));

        // Số điện thoại chứa chữ cái
        Object letterPhone = orderTools.createDeliveryAddress("Số 10 Phố Huế, Hà Nội", "09123abcde");
        assertInstanceOf(Map.class, letterPhone);
        assertEquals(false, ((Map<?, ?>) letterPhone).get("success"));

        // Số điện thoại có dấu gạch ngang hoặc +84 -> chuẩn hóa thành công
        when(aiOrderService.createDeliveryAddress(eq(testCustomer), anyString(), eq("0901234567")))
                .thenReturn(new AiDeliveryAddressResponse(1L, "Số 10 Phố Huế, Hà Nội", "0901234567"));

        Object formattedPhone = orderTools.createDeliveryAddress("Số 10 Phố Huế, Hà Nội", "+84 90-123-4567");
        assertInstanceOf(AiDeliveryAddressResponse.class, formattedPhone);
        verify(aiOrderService).createDeliveryAddress(eq(testCustomer), eq("Số 10 Phố Huế, Hà Nội"), eq("0901234567"));
    }

    @Test
    @DisplayName("OrderTools: placeOrder từ chối các tham số sai biên (items rỗng, null, productId <= 0, quantity <= 0, deliveryId <= 0, payment không hợp lệ)")
    void placeOrder_invalidBoundaryParameters() {
        // 1. items rỗng
        AiPlaceOrderResponse r1 = orderTools.placeOrder(List.of(), 1L, "CASH", null);
        assertEquals("FAILED", r1.orderStatus());
        assertTrue(r1.message().contains("Danh sách sản phẩm"));

        // 2. productId <= 0
        AiPlaceOrderResponse r2 = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(-1L, 2)), 1L, "CASH", null);
        assertEquals("FAILED", r2.orderStatus());
        assertTrue(r2.message().contains("ID sản phẩm"));

        // 3. quantity <= 0
        AiPlaceOrderResponse r3 = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 0)), 1L, "CASH", null);
        assertEquals("FAILED", r3.orderStatus());
        assertTrue(r3.message().contains("Số lượng"));

        // 4. quantity vượt ngưỡng tối đa (> 1000)
        AiPlaceOrderResponse r4 = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 5000)), 1L, "CASH", null);
        assertEquals("FAILED", r4.orderStatus());
        assertTrue(r4.message().contains("vượt quá giới hạn"));

        // 5. deliveryId <= 0
        AiPlaceOrderResponse r5 = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 1)), 0L, "CASH", null);
        assertEquals("FAILED", r5.orderStatus());
        assertTrue(r5.message().contains("địa chỉ giao hàng"));

        // 6. paymentMethod không được hỗ trợ
        AiPlaceOrderResponse r6 = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 1)), 1L, "CRYPTO_USDT", null);
        assertEquals("FAILED", r6.orderStatus());
        assertTrue(r6.message().contains("Phương thức thanh toán"));
    }

    @Test
    @DisplayName("OrderTools: placeOrder chuẩn hóa thông minh phương thức thanh toán (COD, online, tiền mặt)")
    void placeOrder_normalizesPaymentMethodAliases() {
        when(aiOrderService.placeOrder(eq(testCustomer), anyList(), eq(1L), eq("CASH"), any()))
                .thenReturn(new AiPlaceOrderResponse(10L, "PENDING", "CASH", "PENDING", BigDecimal.valueOf(100), null,
                        "OK"));
        when(aiOrderService.placeOrder(eq(testCustomer), anyList(), eq(1L), eq("CREDIT_CARD"), any()))
                .thenReturn(new AiPlaceOrderResponse(11L, "PENDING", "CREDIT_CARD", "PENDING", BigDecimal.valueOf(100),
                        "http://checkout", "OK"));

        // cod -> CASH
        AiPlaceOrderResponse codRes = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 1)), 1L, "cod", null);
        assertEquals("PENDING", codRes.orderStatus());

        // online -> CREDIT_CARD
        AiPlaceOrderResponse onlineRes = orderTools.placeOrder(
                List.of(new CreateOrderItemRequest(1L, 1)), 1L, "thanh toan online", null);
        assertEquals("PENDING", onlineRes.orderStatus());
    }

    @Test
    @DisplayName("OrderTools: cancelOrder từ chối orderId <= 0")
    void cancelOrder_invalidBoundaryIds() {
        AiCancelOrderResponse zeroResult = orderTools.cancelOrder(0L, null, null);
        assertEquals("FAILED", zeroResult.orderStatus());

        AiCancelOrderResponse negativeResult = orderTools.cancelOrder(-5L, null, null);
        assertEquals("FAILED", negativeResult.orderStatus());
    }
}
