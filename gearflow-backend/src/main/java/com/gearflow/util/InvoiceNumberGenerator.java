package com.gearflow.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

public class InvoiceNumberGenerator {
    private static final AtomicLong counter = new AtomicLong(System.currentTimeMillis() % 100000);

    public static String generateJobCardNumber() {
        return "JC-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + String.format("%05d", counter.incrementAndGet() % 100000);
    }

    public static String generateInvoiceNumber() {
        return "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + String.format("%05d", counter.incrementAndGet() % 100000);
    }
}

