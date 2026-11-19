package com.igl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IglApplication {

    public static void main(String[] args) {
        SpringApplication.run(IglApplication.class, args);
    }
}
