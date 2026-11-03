package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Giỏ hàng lưu ở Client (Zustand/LocalStorage) gửi lên Backend khi đăng nhập. */
public record SyncCartRequest(
        @NotNull(message = "Danh sách sản phẩm không được để trống")
        @Size(max = 100, message = "Tối đa 100 sản phẩm")
        List<@Valid @NotNull(message = "Sản phẩm không hợp lệ") CartItemRequest> items
) {
}