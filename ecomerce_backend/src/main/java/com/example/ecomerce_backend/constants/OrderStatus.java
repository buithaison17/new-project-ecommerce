package com.example.ecomerce_backend.constants;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum OrderStatus {
    PENDING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    @JsonCreator
    public static OrderStatus fromString(String value) {
        if (value == null) return null;
        try {
            return OrderStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid OrderStatus: " + value);
        }
    }
}
