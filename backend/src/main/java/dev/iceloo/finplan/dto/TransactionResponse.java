package dev.iceloo.finplan.dto;

import dev.iceloo.finplan.entity.Transaction;
import dev.iceloo.finplan.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        String description,
        LocalDate transactionDate,
        LocalDateTime createdAt,
        Long categoryId
) {

    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(transaction.getId(), transaction.getAmount(), transaction.getType(), transaction.getDescription(), transaction.getTransactionDate(), transaction.getCreatedAt(), transaction.getCategory() == null ? null : transaction.getCategory().getId());
    }
}