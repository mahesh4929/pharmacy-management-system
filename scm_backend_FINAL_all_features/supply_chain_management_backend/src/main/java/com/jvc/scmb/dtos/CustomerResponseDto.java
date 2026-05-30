package com.jvc.scmb.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.jvc.scmb.entities.Order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CustomerResponseDto {

	private Long id;
	
	private String firstName;
	
	private String lastName;
	
	private String address;
	
	private String phoneNumber;
	
	private Boolean active;
	
	private List<Order> orders;
	
	// Audit timestamps populated automatically by JPA Auditing on the entity
	private LocalDateTime createdAt;
	
	private LocalDateTime updatedAt;
}
