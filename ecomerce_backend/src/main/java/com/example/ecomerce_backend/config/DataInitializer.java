package com.example.ecomerce_backend.config;

import com.example.ecomerce_backend.constants.Gender;
import com.example.ecomerce_backend.model.entity.Role;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserInformation;
import com.example.ecomerce_backend.repository.RoleRepository;
import com.example.ecomerce_backend.repository.UserInformationRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserInformationRepository userInformationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            Role customer = Role.builder()
                    .name("CUSTOMER")
                    .build();
            Role admin = Role.builder()
                    .name("ADMIN")
                    .build();
            roleRepository.save(customer);
            roleRepository.save(admin);
        }
        if (userRepository.count() == 0) {
            User user = User.builder()
                    .email("admin@gmail.com")
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .role(roleRepository.findByName("ADMIN").get())
                    .build();
            user = userRepository.save(user);
            UserInformation userInformation = UserInformation.builder()
                    .user(user)
                    .fullName("ADMIN Sơn Bùi")
                    .dateOfBirth(LocalDate.of(2006, 1, 17))
                    .gender(Gender.MALE)
                    .build();
            userInformationRepository.save(userInformation);
        }
    }
}
