package com.jvc.scmb.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.jvc.scmb.entities.Invoice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EmployeeResponseDto {
	private Long id;
	
	private String firstName;
	
	private String lastName;
	
	private String phoneNumber;
	
	private Boolean active;
	
	private Boolean admin;
	
	private List<Invoice> invoices;
	
	// Audit timestamps populated automatically by JPA Auditing on the entity
	private LocalDateTime createdAt;
	
	private LocalDateTime updatedAt;
}
