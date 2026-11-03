package com.example.ecomerce_backend.security.jwt;

import com.example.ecomerce_backend.constants.Gender;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.response.LoginResponse;
import com.example.ecomerce_backend.model.entity.Role;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserInformation;
import com.example.ecomerce_backend.repository.RoleRepository;
import com.example.ecomerce_backend.repository.UserInformationRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import com.example.ecomerce_backend.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomOauthSuccessHandler implements AuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserInformationRepository userInformationRepository;
    private final AuthService authService;
    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // Lấy thông tin người dùng
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String name = oAuth2User.getAttribute("name");
        String sub = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String picture = oAuth2User.getAttribute("picture");

        // Lấy Role customer
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại"));

        // Thông tin đăng nhập
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(sub)
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(customerRole)
                            .build();
                    return userRepository.save(newUser);
                });
        // Tạo thông tin cá nhân nếu chưa có
        if (!userInformationRepository.existsByUser(user)) {
            UserInformation userInformation = UserInformation.builder()
                    .user(user)
                    .fullName(name)
                    .avatarUrl(picture)
                    .gender(Gender.MALE)
                    .dateOfBirth(LocalDate.of(2006, 1, 17))
                    .build();
            userInformationRepository.save(userInformation);
        }

        // Tạo access token và refresh token
        LoginResponse loginResponse = authService.login(user, response);
        response.sendRedirect(frontendUrl + "/oauth2/callback/?accessToken=" + loginResponse.getAccessToken());
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) throws IOException, ServletException {
        AuthenticationSuccessHandler.super.onAuthenticationSuccess(request, response, chain, authentication);
    }
}
