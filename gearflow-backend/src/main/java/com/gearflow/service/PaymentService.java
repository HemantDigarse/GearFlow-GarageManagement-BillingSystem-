package com.gearflow.service;

import com.gearflow.dto.request.PaymentRequest;
import com.gearflow.dto.response.PaymentResponse;
import com.gearflow.entity.*;
import com.gearflow.enums.InvoiceStatus;
import com.gearflow.enums.PaymentMethod;
import com.gearflow.exception.BadRequestException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.InvoiceRepository;
import com.gearflow.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuthService authService;

    public PaymentService(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository, AuthService authService) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.authService = authService;
    }

    public List<PaymentResponse> getAllPayments() {
        Garage garage = authService.getGarageForCurrentUser();
        return paymentRepository.findByGarageId(garage.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Garage garage = authService.getGarageForCurrentUser();

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        if (!invoice.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Invoice not found");
        }

        if (request.getAmount().compareTo(invoice.getRemainingBalance()) > 0) {
            throw new BadRequestException("Payment amount exceeds remaining balance of " + invoice.getRemainingBalance());
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setGarage(garage);
        payment.setCustomer(invoice.getCustomer());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionReference(request.getTransactionReference());
        payment.setNotes(request.getNotes());
        paymentRepository.save(payment);

        // Update invoice
        BigDecimal newAmountPaid = invoice.getAmountPaid().add(request.getAmount());
        BigDecimal newBalance = invoice.getGrandTotal().subtract(newAmountPaid);
        invoice.setAmountPaid(newAmountPaid);
        invoice.setRemainingBalance(newBalance);

        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setRemainingBalance(BigDecimal.ZERO);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);

        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.setId(p.getId());
        r.setInvoiceId(p.getInvoice().getId());
        r.setInvoiceNumber(p.getInvoice().getInvoiceNumber());
        r.setCustomerId(p.getCustomer().getId());
        r.setCustomerName(p.getCustomer().getName());
        r.setAmount(p.getAmount());
        r.setPaymentMethod(p.getPaymentMethod().name());
        r.setPaymentDate(p.getPaymentDate());
        r.setTransactionReference(p.getTransactionReference());
        r.setNotes(p.getNotes());
        return r;
    }
}

