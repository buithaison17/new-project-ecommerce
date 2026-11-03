package com.example.ecomerce_backend.exception;

public class ResourceExistedException extends RuntimeException {
    public ResourceExistedException(String message) {
        super(message);
    }
}
