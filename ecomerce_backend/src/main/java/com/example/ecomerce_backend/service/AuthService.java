package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.Gender;
import com.example.ecomerce_backend.exception.NotMatchPasswordException;
import com.example.ecomerce_backend.exception.ResourceExistedException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.ChangePasswordRequest;
import com.example.ecomerce_backend.model.dto.request.LoginRequest;
import com.example.ecomerce_backend.model.dto.request.RegisterRequest;
import com.example.ecomerce_backend.model.dto.response.LoginResponse;
import com.example.ecomerce_backend.model.dto.response.AuthenticatedUserResponse;
import com.example.ecomerce_backend.model.dto.response.UserRegisterResponse;
import com.example.ecomerce_backend.model.entity.RefreshToken;
import com.example.ecomerce_backend.model.entity.Role;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserInformation;
import com.example.ecomerce_backend.model.mapper.UserMapper;
import com.example.ecomerce_backend.repository.RoleRepository;
import com.example.ecomerce_backend.repository.UserInformationRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import com.example.ecomerce_backend.security.jwt.JwtService;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserInformationRepository userInformationRepository;
    private final UserMapper userMapper;

    public LoginResponse login(LoginRequest request, HttpServletResponse httpServletResponse) {
        // Xác thực thông tin đăng nhập
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.username(), request.password());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        // Tạo token
        String accessToken = jwtService.generateToken(request.username());
        RefreshToken refreshToken = refreshTokenService.generateToken(userPrincipal.getUser());
        // Lưu refresh token vào cookie
        saveRefreshToken(refreshToken, httpServletResponse);
        return LoginResponse.builder().accessToken(accessToken).user(getAuthenticatedUser(userPrincipal.getUser())).build();
    }

    public LoginResponse login(User user, HttpServletResponse httpServletResponse) {
        // Tạo token
        String accessToken = jwtService.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.generateToken(user);
        // Lưu refresh token vào cookie
        saveRefreshToken(refreshToken, httpServletResponse);
        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(getAuthenticatedUser(user))
                .build();
    }

    public void saveRefreshToken(RefreshToken refreshToken, HttpServletResponse httpServletResponse) {
        Cookie cookie = new Cookie("refreshToken", refreshToken.getToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        long maxAge = Duration.between(Instant.now(), refreshToken.getExpiresAt()).getSeconds();
        cookie.setMaxAge((int) maxAge);
        httpServletResponse.addCookie(cookie);
    }

    public AuthenticatedUserResponse getAuthenticatedUser(User user) {
        UserInformation information = userInformationRepository.findByUserId(user.getId()).orElse(null);
        return userMapper.toAuthenticatedUserResponse(user, information);
    }

    @Transactional
    public UserRegisterResponse register(RegisterRequest request) {
        // Kiểm tra email và username
        if (userRepository.existsByEmailOrUsername(request.email(), request.username())) {
            throw new ResourceExistedException("Email hoặc username đã tồn tại");
        }
        // Tạo tài khoản để đăng nhập
        Role customerRole = roleRepository.findByName("CUSTOMER").get();
        User user = User.builder().username(request.username()).email(request.email()).password(passwordEncoder.encode(request.password())).role(customerRole).build();
        user = userRepository.save(user);
        // Tạo thông tin tài khoản
        UserInformation userInformation = UserInformation.builder().user(user).fullName(request.fullName()).dateOfBirth(request.dateOfBirth()).gender(Gender.valueOf(request.gender().toUpperCase())).build();
        userInformation = userInformationRepository.save(userInformation);

        return userMapper.mapToUserRegisterResponse(user, userInformation);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new NotMatchPasswordException("Mật khẩu cũ không khớp");
        }
        if (request.oldPassword().equals(request.newPassword())) {
            throw new NotMatchPasswordException("Mật khẩu mới không được trùng mật khẩu cũ");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public AuthenticatedUserResponse getMe() {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        UserInformation userInformation = userInformationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User information not found"));
        return userMapper.toAuthenticatedUserResponse(user, userInformation);
    }
}