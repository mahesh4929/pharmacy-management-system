package com.jvc.scmb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Application entry point.
 *
 * Note: We exclude SecurityAutoConfiguration because we want only the
 * BCryptPasswordEncoder utility from spring-boot-starter-security — NOT
 * the default web security filter chain. Our authentication is handled by
 * our custom JWT logic in the service layer; we do not want Spring Security's
 * default login page or its blanket request-blocking behavior to interfere.
 */
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableJpaAuditing  // activates @CreatedDate / @LastModifiedDate auto-population in entities
public class SCMBApplication {

	public static void main(String[] args) {
		SpringApplication.run(SCMBApplication.class, args);
	}

	/**
	 * Provides a single BCryptPasswordEncoder instance that Spring will
	 * inject wherever a PasswordEncoder is needed (Seeder and LoginServiceImpl).
	 * Using the default strength of 10 rounds — a good balance between
	 * security and login response time.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
