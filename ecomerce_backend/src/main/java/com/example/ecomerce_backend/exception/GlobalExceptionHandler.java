package com.example.ecomerce_backend.exception;

import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiDataResponse<Map<String, String>>> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();
        for (var fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                "Lỗi input",
                null, errors,
                HttpStatus.BAD_REQUEST
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiDataResponse<Map<String, String>>>
    handleBadCredentialsException(BadCredentialsException exception) {
        return new ResponseEntity<>(
                new ApiDataResponse<>(
                        false,
                        "Tên đăng nhập hoặc mật khẩu không chính xác",
                        null,
                        null,
                        HttpStatus.UNAUTHORIZED
                ),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleUsernameNotFoundException(UsernameNotFoundException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.UNAUTHORIZED
        ), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleJwtException(JwtException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.UNAUTHORIZED
        ), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResourceExistedException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleResourceExistedException(ResourceExistedException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.BAD_REQUEST
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RefreshTokenInvalidException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleRefreshTokenInvalidException(RefreshTokenInvalidException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.NOT_FOUND
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.NOT_FOUND
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleBadRequestException(BadRequestException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.BAD_REQUEST
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleInsufficientStockException(InsufficientStockException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.CONFLICT
        ), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(NotMatchPasswordException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleNotMatchPasswordException(NotMatchPasswordException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.BAD_REQUEST
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(CheckoutException.class)
    public ResponseEntity<ApiDataResponse<Void>> handleCheckoutException(CheckoutException exception) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                exception.getMessage(),
                null,
                null,
                HttpStatus.BAD_REQUEST
        ), HttpStatus.BAD_REQUEST);
    }


}
