package com.gearflow.repository;

import com.gearflow.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByGarageId(Long garageId);
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByGarageIdAndPaymentDateBetween(Long garageId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.garage.id = :garageId")
    BigDecimal sumAmountByGarageId(@Param("garageId") Long garageId);
}

