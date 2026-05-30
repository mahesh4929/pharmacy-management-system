package com.jvc.scmb.dtos;

import java.util.List;

import com.jvc.scmb.entities.Order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CustomerRequestDto {

	private CredentialsDto credentials;

	@NotBlank(message = "First name is required")
	@Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
	private String firstName;

	@NotBlank(message = "Last name is required")
	@Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
	private String lastName;

	@NotBlank(message = "Address is required")
	@Size(max = 200, message = "Address cannot exceed 200 characters")
	private String address;

	@NotBlank(message = "Phone number is required")
	@Pattern(regexp = "^[0-9\\-]{10,15}$", message = "Phone must contain 10-15 digits (dashes allowed)")
	private String phoneNumber;

	private Boolean active;

	private List<Order> orders;
}
