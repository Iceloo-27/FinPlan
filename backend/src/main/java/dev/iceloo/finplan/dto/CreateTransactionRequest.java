package dev.iceloo.finplan.dto;

import dev.iceloo.finplan.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(

        @NotNull
        @DecimalMin("0.01")
        @Digits(integer = 17, fraction = 2)
        BigDecimal amount,

        @NotNull
        TransactionType type,

        @Size(max = 255)
        String description,

        @NotNull
        LocalDate transactionDate,

        Long categoryId
) {
}