package com.jvc.scmb.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrderedItemRequestDto {

	@NotNull(message = "Stock ID is required for each ordered item")
	@Positive(message = "Stock ID must be positive")
	private Long stock_id;

	@Positive(message = "Ordered amount must be greater than zero")
	private int amount;
}
