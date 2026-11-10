package com.example.ecomerce_backend.config;

import com.example.ecomerce_backend.security.jwt.CustomOauthSuccessHandler;
import com.example.ecomerce_backend.security.jwt.CustomerAuthenticationEntryPoint;
import com.example.ecomerce_backend.security.jwt.JwtFilterBefore;
import com.example.ecomerce_backend.security.principal.UserPrincipalService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {
    private final CustomerAuthenticationEntryPoint customerAuthenticationEntryPoint;
    private final CustomOauthSuccessHandler customOauthSuccessHandler;
    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity, JwtFilterBefore jwtFilterBefore) {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/oauth2/**", "/login/**").permitAll()
                        .requestMatchers("/api/v1/users/me").authenticated()
                        .requestMatchers("/api/v1/auth/logout").authenticated()
                        // Catalog công khai: khách chưa đăng nhập vẫn xem được sản phẩm & ảnh
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/flash-sales/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        // Toàn bộ API quản trị chỉ dành cho ADMIN
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/orders/**").authenticated()
                        .requestMatchers("/api/v1/cart/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/payment-requests/webhook-handler").permitAll()
                        .requestMatchers("/api/v1/payment-requests/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/banks/**").permitAll()
                        .requestMatchers("/api/v1/ai/**").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customerAuthenticationEntryPoint))
                .addFilterBefore(jwtFilterBefore, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth -> oauth.successHandler(customOauthSuccessHandler))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cấu hình các phương thức HTTP
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        // Frontend được phép truy cập
        configuration.setAllowedOrigins(
                List.of(
                        "http://novashop1.duckdns.org",
                        frontendUrl,
                        "https://novashop1.duckdns.org"
                ));
        // Cho phép gửi cookie hoặc thông tin xác thực
        configuration.setAllowCredentials(true);
        // Các request header được phép
        configuration.setAllowedHeaders(
                List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng cho tất cả endpoint
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
