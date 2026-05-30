package com.jvc.scmb.dtos;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class OrderRequestDto {

	@NotNull(message = "Customer ID is required")
	@Positive(message = "Customer ID must be positive")
	private Long customer_id;

	@NotEmpty(message = "Order must contain at least one item")
	@Valid  // cascades validation into each OrderedItemRequestDto in the list
	private List<OrderedItemRequestDto> ordered_items;
}
