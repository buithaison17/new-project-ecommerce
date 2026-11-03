package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.LoginRequest;
import com.example.ecomerce_backend.model.dto.request.RegisterRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.AuthenticatedUserResponse;
import com.example.ecomerce_backend.model.dto.response.LoginResponse;
import com.example.ecomerce_backend.model.dto.response.UserRegisterResponse;
import com.example.ecomerce_backend.service.AuthService;
import com.example.ecomerce_backend.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.login(loginRequest, response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiDataResponse<UserRegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đăng kí thành công",
                authService.register(request),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@CookieValue("refreshToken") String refreshToken) {
        return new ResponseEntity<>(refreshTokenService.refreshToken(refreshToken), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiDataResponse<Void>> logout(@CookieValue("refreshToken") String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đăng xuất thành công",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiDataResponse<AuthenticatedUserResponse>> getMe() {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy thông tin người dùng thành công",
                authService.getMe(),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }
}