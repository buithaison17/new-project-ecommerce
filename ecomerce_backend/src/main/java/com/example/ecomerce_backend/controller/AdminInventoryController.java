package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.RestockRequest;
import com.example.ecomerce_backend.model.dto.request.UpdateStockRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.InventoryResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/inventories")
@RequiredArgsConstructor
public class AdminInventoryController {
    private final InventoryService inventoryService;

    /** Danh sách tồn kho; lowStockOnly=true chỉ lấy các sản phẩm dưới ngưỡng cảnh báo. */
    @GetMapping
    public ResponseEntity<ApiDataResponse<PageResponse<InventoryResponse>>> list(
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy danh sách tồn kho thành công",
                inventoryService.list(lowStockOnly, page, size)));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ApiDataResponse<InventoryResponse>> get(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy tồn kho thành công", inventoryService.getByProductId(productId)));
    }

    /** Nhập thêm hàng (cộng dồn). */
    @PatchMapping("/products/{productId}/restock")
    public ResponseEntity<ApiDataResponse<InventoryResponse>> restock(
            @PathVariable Long productId, @Valid @RequestBody RestockRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Nhập kho thành công",
                inventoryService.restock(productId, request.quantity())));
    }

    /** Đặt lại tồn kho về đúng một số lượng (kiểm kê). */
    @PutMapping("/products/{productId}")
    public ResponseEntity<ApiDataResponse<InventoryResponse>> setQuantity(
            @PathVariable Long productId, @Valid @RequestBody UpdateStockRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Cập nhật tồn kho thành công",
                inventoryService.setQuantity(productId, request.quantity())));
    }
}