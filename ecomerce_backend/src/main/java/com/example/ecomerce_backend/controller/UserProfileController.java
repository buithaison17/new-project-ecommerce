package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.response.AuthenticatedUserResponse;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import com.example.ecomerce_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserProfileController {
    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(authService.getAuthenticatedUser(userPrincipal.getUser()));
    }
}