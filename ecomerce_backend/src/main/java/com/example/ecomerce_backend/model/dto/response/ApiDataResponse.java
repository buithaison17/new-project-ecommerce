package com.example.ecomerce_backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ApiDataResponse<T> {
    private Boolean success;
    private String message;
    private T data;
    private T errors;
    private HttpStatus status;

    public static <T> ApiDataResponse<T> ok(String message, T data) {
        return new ApiDataResponse<>(true, message, data, null, HttpStatus.OK);
    }

    public static <T> ApiDataResponse<T> created(String message, T data) {
        return new ApiDataResponse<>(true, message, data, null, HttpStatus.CREATED);
    }
}
