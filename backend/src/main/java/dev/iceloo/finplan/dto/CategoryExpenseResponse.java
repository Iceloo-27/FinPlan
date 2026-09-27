package dev.iceloo.finplan.dto;

import java.math.BigDecimal;

public record CategoryExpenseResponse(Long categoryId, String categoryName, BigDecimal totalExpense) {
}