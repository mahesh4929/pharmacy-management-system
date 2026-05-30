package com.jvc.scmb.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Abstract base class providing audit fields for all entities.
 *
 * Why this exists:
 *   Every business entity (Stock, Customer, Order, etc.) needs to track
 *   WHEN it was created and WHEN it was last modified. Rather than copying
 *   these fields into every entity, we centralize them here.
 *
 * How auditing works:
 *   @MappedSuperclass tells JPA: "This class is not its own table.
 *       Its fields should be added to the child entity's table."
 *
 *   @EntityListeners(AuditingEntityListener.class) tells JPA to listen
 *       for INSERT and UPDATE events and automatically populate the
 *       @CreatedDate and @LastModifiedDate fields.
 *
 *   @CreatedDate is set ONCE when the row is first inserted.
 *   @LastModifiedDate is set on insert AND on every update.
 *
 *   @Column(updatable = false) on createdAt prevents accidental
 *       overwrites of the original creation timestamp.
 *
 * Activation:
 *   This functionality requires @EnableJpaAuditing on a @Configuration class
 *   or on the main application class (SCMBApplication).
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
