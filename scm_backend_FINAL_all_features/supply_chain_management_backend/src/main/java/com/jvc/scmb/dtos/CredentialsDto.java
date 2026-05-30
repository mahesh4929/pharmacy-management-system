package com.jvc.scmb.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CredentialsDto {

	@NotBlank(message = "Username is required")
	@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
	private String username;

	@NotBlank(message = "Password is required")
	@Size(min = 4, max = 100, message = "Password must be between 4 and 100 characters")
	private String password;
}
