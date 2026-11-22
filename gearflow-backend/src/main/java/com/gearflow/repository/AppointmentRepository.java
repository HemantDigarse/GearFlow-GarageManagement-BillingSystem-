package com.gearflow.repository;

import com.gearflow.entity.Appointment;
import com.gearflow.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByGarageId(Long garageId);
    List<Appointment> findByGarageIdAndAppointmentDate(Long garageId, LocalDate date);
    long countByGarageIdAndAppointmentDate(Long garageId, LocalDate date);
    List<Appointment> findByGarageIdAndStatus(Long garageId, AppointmentStatus status);
}

