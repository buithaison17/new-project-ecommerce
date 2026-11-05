package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.RefreshTokenInvalidException;
import com.example.ecomerce_backend.model.dto.response.LoginResponse;
import com.example.ecomerce_backend.model.entity.RefreshToken;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.repository.RefreshTokenRepository;
import com.example.ecomerce_backend.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    @Value("${jwt.refresh-expiration}")
    private long expirationTime;

    public RefreshToken generateToken(User user) {
        Instant expiresAt = Instant.now().plusMillis(expirationTime);
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(expiresAt)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    public LoginResponse refreshToken(String token) {
        // Lấy token
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new NoSuchElementException("Refresh token không tồn tại"));
        // Kiểm tra token đã hết hoặc hoặc bị thu hồi
        if (refreshToken.getIsRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RefreshTokenInvalidException("Refresh token đã hết hạn hoặc bị thu hồi");
        }
        // Tạo access token mới
        String accessToken = jwtService.generateToken(refreshToken.getUser().getEmail());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public void revokeToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new NoSuchElementException("Refresh token không tồn tại"));
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
}