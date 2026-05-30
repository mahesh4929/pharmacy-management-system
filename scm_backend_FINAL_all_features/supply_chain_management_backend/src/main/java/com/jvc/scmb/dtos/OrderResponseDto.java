package com.jvc.scmb.dtos;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import com.jvc.scmb.entities.Invoice;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class OrderResponseDto {
	private Long id; 
	
	private Long customer_id;

	private List<OrderedItemResponseDto> ordered_items;
	
    private Timestamp date;
    
    private Invoice invoice;
    
    // Audit timestamps populated automatically by JPA Auditing on the entity
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
