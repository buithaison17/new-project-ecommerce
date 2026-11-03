package com.example.ecomerce_backend.model.dto.response;

import java.time.LocalDateTime;

public record InventoryResponse(
        Long productId,
        String productName,
        Integer quantity,
        Integer reservedQuantity,
        Integer availableQuantity,
        Boolean lowStock,
        LocalDateTime updatedAt
) {
}
