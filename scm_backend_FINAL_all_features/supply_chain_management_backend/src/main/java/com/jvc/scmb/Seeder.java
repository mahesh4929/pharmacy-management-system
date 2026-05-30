package com.jvc.scmb;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.jvc.scmb.entities.Credentials;
import com.jvc.scmb.entities.Customer;
import com.jvc.scmb.entities.Employee;
import com.jvc.scmb.repositories.CustomerRepository;
import com.jvc.scmb.repositories.EmployeeRepository;
import com.jvc.scmb.repositories.StockRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Bootstrap Seeder.
 *
 * Responsibility:
 *   - Creates the minimum data needed for the system to be usable on first startup
 *   - Only runs if the database has no employees yet
 *   - On subsequent restarts, does nothing (data persists thanks to ddl-auto=update)
 *
 * What it seeds:
 *   - 1 admin employee (so the system has an entry point to log in)
 *   - 1 regular employee (so role-based authorization can be demonstrated)
 *   - 2 customer accounts (so customer login flow can be demonstrated)
 *
 * What it does NOT seed:
 *   - No medicines, orders, or invoices
 *   - All business data is added via admin APIs after startup
 *
 * Note: This is the same pattern used by production SaaS systems —
 *       create a bootstrap admin on first install, then let users
 *       populate the system through normal application workflows.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class Seeder implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final StockRepository stockRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Smart Seeder: only seed if no employees exist.
        // If admin already exists, we're past first-startup — do nothing.
        if (employeeRepository.count() > 0) {
            log.info("Employees exist. Skipping seeder. (Database is persistent.)");
            return;
        }

        log.info("Empty database detected. Seeding bootstrap users only...");

        seedBootstrapEmployees();
        seedBootstrapCustomers();

        log.info("Bootstrap complete.");
        log.info("Admin login: jchiarella / jasonspassword");
        log.info("Employee login: ttesty / testspassword");
        log.info("Customer login: jcustomer / password (or tcustomer / password)");
        log.info("Stock catalog is EMPTY — add medicines via POST /stock/new with admin token.");
    }

    /**
     * Creates two employee accounts:
     *   - One admin (can manage stock catalog)
     *   - One regular employee (can fulfill invoices but cannot manage stock)
     * This is acceptable bootstrap data — every system needs admin accounts to be operable.
     */
    private void seedBootstrapEmployees() {
        Employee admin = new Employee();
        admin.setFirstName("Jason");
        admin.setLastName("Chiarella");
        admin.setPhoneNumber("111-111-1111");
        admin.setActive(true);
        admin.setAdmin(true);
        Credentials adminCreds = new Credentials();
        adminCreds.setUsername("jchiarella");
        adminCreds.setPassword(passwordEncoder.encode("jasonspassword"));
        admin.setCredentials(adminCreds);
        employeeRepository.saveAndFlush(admin);

        Employee employee = new Employee();
        employee.setFirstName("Test");
        employee.setLastName("Testy");
        employee.setPhoneNumber("222-222-2222");
        employee.setActive(true);
        employee.setAdmin(false);
        Credentials empCreds = new Credentials();
        empCreds.setUsername("ttesty");
        empCreds.setPassword(passwordEncoder.encode("testspassword"));
        employee.setCredentials(empCreds);
        employeeRepository.saveAndFlush(employee);
    }

    /**
     * Creates two customer accounts so the login + order placement flow
     * can be demonstrated without needing a separate customer self-signup flow.
     * In production, this would be replaced by a real customer signup endpoint.
     */
    private void seedBootstrapCustomers() {
        Customer customer1 = new Customer();
        customer1.setFirstName("Jane");
        customer1.setLastName("Doe");
        customer1.setAddress("12 MG Road, Pune, MH 411001");
        customer1.setPhoneNumber("9876543210");
        customer1.setActive(true);
        Credentials c1 = new Credentials();
        c1.setUsername("jcustomer");
        c1.setPassword(passwordEncoder.encode("password"));
        customer1.setCredentials(c1);
        customerRepository.saveAndFlush(customer1);

        Customer customer2 = new Customer();
        customer2.setFirstName("Rahul");
        customer2.setLastName("Sharma");
        customer2.setAddress("45 FC Road, Pune, MH 411004");
        customer2.setPhoneNumber("9876512345");
        customer2.setActive(true);
        Credentials c2 = new Credentials();
        c2.setUsername("tcustomer");
        c2.setPassword(passwordEncoder.encode("password"));
        customer2.setCredentials(c2);
        customerRepository.saveAndFlush(customer2);
    }
}
