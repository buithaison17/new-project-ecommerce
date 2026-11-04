package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.CartItemRequest;
import com.example.ecomerce_backend.model.dto.request.SyncCartRequest;
import com.example.ecomerce_backend.model.dto.request.UpdateCartItemRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.CartResponse;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import com.example.ecomerce_backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Giỏ hàng của người dùng đang đăng nhập (mọi endpoint yêu cầu Bearer token).
 */
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiDataResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy giỏ hàng thành công",
                cartService.getCart(principal.getUser().getId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiDataResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody CartItemRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Thêm vào giỏ hàng thành công",
                cartService.addItem(principal.getUser().getId(), request.productId(), request.quantity())));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiDataResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId, @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Cập nhật giỏ hàng thành công",
                cartService.updateItem(principal.getUser().getId(), productId, request.quantity())));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiDataResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Xóa sản phẩm khỏi giỏ hàng thành công",
                cartService.removeItem(principal.getUser().getId(), productId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiDataResponse<CartResponse>> clear(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiDataResponse.ok("Đã làm sạch giỏ hàng",
                cartService.clear(principal.getUser().getId())));
    }

    /**
     * Đồng bộ giỏ hàng lưu ở Client lên Backend sau khi đăng nhập.
     */
    @PostMapping("/sync")
    public ResponseEntity<ApiDataResponse<CartResponse>> sync(
            @AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody SyncCartRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Đồng bộ giỏ hàng thành công",
                cartService.sync(principal.getUser().getId(), request.items())));
    }
}