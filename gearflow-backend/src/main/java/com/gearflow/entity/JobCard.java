package com.gearflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gearflow.enums.JobPriority;
import com.gearflow.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "garage_id", nullable = false)
    @JsonIgnore
    private Garage garage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @Column(unique = true, nullable = false)
    private String jobCardNumber;

    @Column(columnDefinition = "TEXT")
    private String problemDescription;

    private LocalDate estimatedCompletionDate;

    @Enumerated(EnumType.STRING)
    private JobPriority priority = JobPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.CREATED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobCardItem> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
