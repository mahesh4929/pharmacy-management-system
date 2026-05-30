package com.jvc.scmb.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class StockRequestDto {

	@NotBlank(message = "Stock item name is required")
	@Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
	private String name;

	@Size(max = 500, message = "Description cannot exceed 500 characters")
	private String description;

	@PositiveOrZero(message = "Count cannot be negative")
	private Integer count;

	@Positive(message = "Price must be greater than zero")
	private Double price;
}
