package com.gearflow.service;

import com.gearflow.dto.request.InvoiceRequest;
import com.gearflow.dto.response.InvoiceResponse;
import com.gearflow.entity.*;
import com.gearflow.enums.InvoiceStatus;
import com.gearflow.enums.JobStatus;
import com.gearflow.exception.BadRequestException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.InvoiceRepository;
import com.gearflow.repository.JobCardRepository;
import com.gearflow.util.InvoiceNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final AuthService authService;

    public InvoiceService(InvoiceRepository invoiceRepository, JobCardRepository jobCardRepository, AuthService authService) {
        this.invoiceRepository = invoiceRepository;
        this.jobCardRepository = jobCardRepository;
        this.authService = authService;
    }

    public List<InvoiceResponse> getAllInvoices(String status) {
        Garage garage = authService.getGarageForCurrentUser();
        List<Invoice> invoices;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            invoices = invoiceRepository.findByGarageIdAndStatus(garage.getId(), InvoiceStatus.valueOf(status));
        } else {
            invoices = invoiceRepository.findByGarageId(garage.getId());
        }
        return invoices.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = findByIdAndGarage(id);
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse generateInvoice(Long jobCardId, InvoiceRequest request) {
        Garage garage = authService.getGarageForCurrentUser();

        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new ResourceNotFoundException("Job card not found"));
        if (!jobCard.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Job card not found");
        }
        if (jobCard.getStatus() != JobStatus.COMPLETED) {
            throw new BadRequestException("Invoice can only be generated for completed job cards");
        }
        if (invoiceRepository.findByJobCardId(jobCardId).isPresent()) {
            throw new BadRequestException("Invoice already exists for this job card");
        }

        // Calculate service charges from job card items
        BigDecimal serviceCharges = BigDecimal.ZERO;
        for (JobCardItem item : jobCard.getItems()) {
            serviceCharges = serviceCharges.add(item.getTotalPrice());
        }

        BigDecimal sparePartsCharges = request.getSparePartsCharges() != null ? request.getSparePartsCharges() : BigDecimal.ZERO;
        BigDecimal labourCharges = request.getLabourCharges() != null ? request.getLabourCharges() : BigDecimal.ZERO;
        BigDecimal taxPercentage = request.getTaxPercentage() != null ? request.getTaxPercentage() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;

        BigDecimal subtotal = serviceCharges.add(sparePartsCharges).add(labourCharges);
        BigDecimal taxAmount = subtotal.multiply(taxPercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(taxAmount).subtract(discount);

        Invoice invoice = new Invoice();
        invoice.setJobCard(jobCard);
        invoice.setGarage(garage);
        invoice.setCustomer(jobCard.getCustomer());
        invoice.setInvoiceNumber(InvoiceNumberGenerator.generateInvoiceNumber());
        invoice.setServiceCharges(serviceCharges);
        invoice.setSparePartsCharges(sparePartsCharges);
        invoice.setLabourCharges(labourCharges);
        invoice.setTaxPercentage(taxPercentage);
        invoice.setTaxAmount(taxAmount);
        invoice.setDiscount(discount);
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setRemainingBalance(grandTotal);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setNotes(request.getNotes());

        // Create invoice items from job card items
        List<InvoiceItem> invoiceItems = new ArrayList<>();
        for (JobCardItem jci : jobCard.getItems()) {
            InvoiceItem ii = new InvoiceItem();
            ii.setInvoice(invoice);
            ii.setDescription(jci.getService().getName());
            ii.setQuantity(jci.getQuantity());
            ii.setUnitPrice(jci.getUnitPrice());
            ii.setTotalPrice(jci.getTotalPrice());
            invoiceItems.add(ii);
        }
        invoice.setItems(invoiceItems);

        invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    private Invoice findByIdAndGarage(Long id) {
        Garage garage = authService.getGarageForCurrentUser();
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        if (!invoice.getGarage().getId().equals(garage.getId())) {
            throw new ResourceNotFoundException("Invoice not found");
        }
        return invoice;
    }

    private InvoiceResponse toResponse(Invoice inv) {
        InvoiceResponse r = new InvoiceResponse();
        r.setId(inv.getId());
        r.setInvoiceNumber(inv.getInvoiceNumber());
        r.setInvoiceDate(inv.getInvoiceDate());
        r.setJobCardId(inv.getJobCard().getId());
        r.setJobCardNumber(inv.getJobCard().getJobCardNumber());
        r.setCustomerId(inv.getCustomer().getId());
        r.setCustomerName(inv.getCustomer().getName());
        r.setCustomerMobile(inv.getCustomer().getMobile());
        r.setCustomerEmail(inv.getCustomer().getEmail());
        r.setCustomerAddress(inv.getCustomer().getAddress());
        r.setVehicleRegNumber(inv.getJobCard().getVehicle().getRegistrationNumber());
        r.setVehicleBrand(inv.getJobCard().getVehicle().getBrand());
        r.setVehicleModel(inv.getJobCard().getVehicle().getModel());
        r.setGarageName(inv.getGarage().getName());
        r.setGarageAddress(inv.getGarage().getAddress());
        r.setGaragePhone(inv.getGarage().getPhone());
        r.setGarageEmail(inv.getGarage().getEmail());
        r.setServiceCharges(inv.getServiceCharges());
        r.setSparePartsCharges(inv.getSparePartsCharges());
        r.setLabourCharges(inv.getLabourCharges());
        r.setTaxPercentage(inv.getTaxPercentage());
        r.setTaxAmount(inv.getTaxAmount());
        r.setDiscount(inv.getDiscount());
        r.setGrandTotal(inv.getGrandTotal());
        r.setAmountPaid(inv.getAmountPaid());
        r.setRemainingBalance(inv.getRemainingBalance());
        r.setStatus(inv.getStatus().name());
        r.setNotes(inv.getNotes());
        r.setCreatedAt(inv.getCreatedAt());

        List<InvoiceResponse.InvoiceItemResponse> items = new ArrayList<>();
        if (inv.getItems() != null) {
            for (InvoiceItem ii : inv.getItems()) {
                InvoiceResponse.InvoiceItemResponse ir = new InvoiceResponse.InvoiceItemResponse();
                ir.setId(ii.getId());
                ir.setDescription(ii.getDescription());
                ir.setQuantity(ii.getQuantity());
                ir.setUnitPrice(ii.getUnitPrice());
                ir.setTotalPrice(ii.getTotalPrice());
                items.add(ir);
            }
        }
        r.setItems(items);
        return r;
    }
}

