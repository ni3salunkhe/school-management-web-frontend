package com.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import ch.qos.logback.core.net.SyslogOutputStream;

@SpringBootApplication
@ComponentScan(basePackages = "com.api")
@EntityScan(basePackages = "com.api.entity")
@EnableJpaRepositories(basePackages = "com.api.repository")
public class SchoolRegisterApplication {
    public static void main(String[] args) {
        SpringApplication.run(SchoolRegisterApplication.class, args);
        System.out.println("Running Server");
    }
}
