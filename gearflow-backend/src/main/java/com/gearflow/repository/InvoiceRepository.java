package com.gearflow.repository;

import com.gearflow.entity.Invoice;
import com.gearflow.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByGarageId(Long garageId);
    List<Invoice> findByGarageIdAndStatus(Long garageId, InvoiceStatus status);
    long countByGarageId(Long garageId);
    Optional<Invoice> findByJobCardId(Long jobCardId);

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i WHERE i.garage.id = :garageId")
    BigDecimal sumGrandTotalByGarageId(@Param("garageId") Long garageId);

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i")
    BigDecimal sumAllGrandTotal();

    @Query("SELECT COALESCE(SUM(i.remainingBalance), 0) FROM Invoice i WHERE i.garage.id = :garageId")
    BigDecimal sumRemainingBalanceByGarageId(@Param("garageId") Long garageId);
}

