package com.jvc.scmb.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class StockResponseDto {
	
	private Long id;
	
	private String name;
	
	private String description;
	
	private Integer count; 
	
	private Double price;
	
	// Audit timestamps populated automatically by JPA Auditing on the entity
	private LocalDateTime createdAt;
	
	private LocalDateTime updatedAt;
}
