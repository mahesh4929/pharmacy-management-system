package com.jvc.scmb.dtos;

import com.jvc.scmb.entities.Employee;
import com.jvc.scmb.entities.Order;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class InvoiceRequestDto {

	private Order order;

	private String status;

	@PositiveOrZero(message = "Total price cannot be negative")
	private double totalPrice;

	private Employee employee;
}
