package com.jvc.scmb.services.impl;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jvc.scmb.dtos.CredentialsDto;
import com.jvc.scmb.entities.Customer;
import com.jvc.scmb.entities.Employee;
import com.jvc.scmb.exceptions.BadRequestException;
import com.jvc.scmb.exceptions.NotAuthorizedException;
import com.jvc.scmb.repositories.CustomerRepository;
import com.jvc.scmb.repositories.EmployeeRepository;
import com.jvc.scmb.services.LoginService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginServiceImpl implements LoginService {
	
	private final CustomerRepository customerRepository;
	private final EmployeeRepository employeeRepository;
	private final PasswordEncoder passwordEncoder;
	
	@Override
	public Customer loginCustomer(CredentialsDto credentialsRequestDto) {
		log.info("Customer login attempt: username={}", credentialsRequestDto.getUsername());
		
		//check credentials, username, password, and name were provided
        if(credentialsRequestDto.getUsername() == null || credentialsRequestDto.getPassword() == null ) {
            throw new BadRequestException("one or more fields missing in request");
        }

        //credentials should be a valid customer; only an active customer can add a new customer
        Optional<Customer> optionalUser = customerRepository.findByCredentialsUsername(credentialsRequestDto.getUsername());
        if(optionalUser.isEmpty()) {
        	log.warn("Customer login failed - user not found: username={}", credentialsRequestDto.getUsername());
        	throw new NotAuthorizedException("user with provided credentials not found");
        }

        //check that found user is active
        Customer foundCustomer = optionalUser.get();
        if(!foundCustomer.getActive()) {
        	log.warn("Customer login failed - user inactive: username={}", credentialsRequestDto.getUsername());
        	throw new NotAuthorizedException("non-active user");
        }
        
        //check password using BCrypt — compares plain-text from request with stored hash
        if(!passwordEncoder.matches(credentialsRequestDto.getPassword(), foundCustomer.getCredentials().getPassword())) {
        	log.warn("Customer login failed - incorrect password: username={}", credentialsRequestDto.getUsername());
            throw new NotAuthorizedException("password incorrect");
        }
        
        log.info("Customer login successful: username={}, customerId={}", credentialsRequestDto.getUsername(), foundCustomer.getId());
        //return customer
        return foundCustomer;
	}

	@Override
	public Employee loginEmployee(CredentialsDto credentialsRequestDto) {
		log.info("Employee login attempt: username={}", credentialsRequestDto.getUsername());
		
		//check credentials, username, password, and name were provided
        if(credentialsRequestDto.getUsername() == null || credentialsRequestDto.getPassword() == null ) {
            throw new BadRequestException("one or more fields missing in request");
        }

        //credentials should be a valid employee; only an active employee can add a new employee
        Optional<Employee> optionalUser = employeeRepository.findByCredentialsUsername(credentialsRequestDto.getUsername());
        if(optionalUser.isEmpty()) {
        	log.warn("Employee login failed - user not found: username={}", credentialsRequestDto.getUsername());
        	throw new NotAuthorizedException("user with provided credentials not found");
        }

        //check that found user is active
        Employee foundEmployee = optionalUser.get();
        if(!foundEmployee.getActive()) {
        	log.warn("Employee login failed - user inactive: username={}", credentialsRequestDto.getUsername());
        	throw new NotAuthorizedException("non-active user");
        }
        
        //check password using BCrypt — compares plain-text from request with stored hash
        if(!passwordEncoder.matches(credentialsRequestDto.getPassword(), foundEmployee.getCredentials().getPassword())) {
        	log.warn("Employee login failed - incorrect password: username={}", credentialsRequestDto.getUsername());
            throw new NotAuthorizedException("password incorrect");
        }
        
        log.info("Employee login successful: username={}, employeeId={}, isAdmin={}", 
        	credentialsRequestDto.getUsername(), foundEmployee.getId(), foundEmployee.getAdmin());
        //return employee
        return foundEmployee;
	}

}
