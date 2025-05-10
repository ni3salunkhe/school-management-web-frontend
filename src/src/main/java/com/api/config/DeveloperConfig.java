package com.api.config;

import java.sql.Date;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.api.entity.Developer;
import com.api.service.DeveloperService;

@Configuration
public class DeveloperConfig {

	@Bean
	 public CommandLineRunner addDeveloperAccount(DeveloperService developerService) {
		return args->{
			if(developerService.getByUsername("Developer96") == null) {
				BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();
				String encodePassword = passwordEncoder.encode("Developer@96");
				
				Developer developer= new Developer();
				developer.setEmail("developer@gmail.com");
				developer.setUsername("Developer96");
				developer.setPassword(encodePassword);
				developer.setPhone("1234569009");
				developer.setRole("DEVELOPER");
				developer.setCreatedAt(new Date(System.currentTimeMillis()));
				
				developerService.saveData(developer);
			}
		};
	}
}
