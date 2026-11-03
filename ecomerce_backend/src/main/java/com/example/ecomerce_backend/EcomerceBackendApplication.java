package com.example.ecomerce_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class EcomerceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcomerceBackendApplication.class, args);
    }

}
