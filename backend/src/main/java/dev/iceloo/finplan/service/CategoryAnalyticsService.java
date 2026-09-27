package dev.iceloo.finplan.service;

import dev.iceloo.finplan.dto.CategoryExpenseResponse;
import dev.iceloo.finplan.entity.Category;
import dev.iceloo.finplan.entity.Transaction;
import dev.iceloo.finplan.entity.TransactionType;
import dev.iceloo.finplan.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategoryAnalyticsService {

    private final TransactionRepository transactionRepository;

    public CategoryAnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryExpenseResponse> getMonthlyExpenses(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);

        List<Transaction> transactions = transactionRepository.findByTransactionDateBetween(yearMonth.atDay(1), yearMonth.atEndOfMonth());

        Map<Long, CategoryExpenseResponse> expensesByCategory = new LinkedHashMap<>();

        for (Transaction transaction : transactions) {
            if (transaction.getType() != TransactionType.EXPENSE) {
                continue;
            }

            Category category = transaction.getCategory();

            Long categoryId = category == null ? null : category.getId();

            String categoryName = category == null ? "Без категории" : category.getName();

            CategoryExpenseResponse previous = expensesByCategory.get(categoryId);

            BigDecimal previousTotal = previous == null ? BigDecimal.ZERO : previous.totalExpense();

            BigDecimal newTotal = previousTotal.add(transaction.getAmount());

            expensesByCategory.put(categoryId, new CategoryExpenseResponse(categoryId, categoryName, newTotal));
        }

        return List.copyOf(expensesByCategory.values());
    }
}