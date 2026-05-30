package com.jvc.scmb.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EmployeeRequestDto {

	private CredentialsDto credentials;

	@NotBlank(message = "First name is required")
	@Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
	private String firstName;

	@NotBlank(message = "Last name is required")
	@Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
	private String lastName;

	@NotBlank(message = "Phone number is required")
	@Pattern(regexp = "^[0-9\\-]{10,15}$", message = "Phone must contain 10-15 digits (dashes allowed)")
	private String phoneNumber;

	private Boolean active;

	private Boolean admin;
}
