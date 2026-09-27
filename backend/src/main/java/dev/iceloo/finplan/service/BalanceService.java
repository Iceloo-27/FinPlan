package dev.iceloo.finplan.service;

import dev.iceloo.finplan.dto.BalanceResponse;
import dev.iceloo.finplan.entity.Transaction;
import dev.iceloo.finplan.entity.TransactionType;
import dev.iceloo.finplan.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.time.YearMonth;

@Service
public class BalanceService {

    private final TransactionRepository transactionRepository;

    public BalanceService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BalanceResponse getBalance() {
        return calculateBalance(transactionRepository.findAll());
    }

    public BalanceResponse getMonthlyBalance(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);

        List<Transaction> transactions = transactionRepository.findByTransactionDateBetween(yearMonth.atDay(1), yearMonth.atEndOfMonth());

        return calculateBalance(transactions);
    }

    private BalanceResponse calculateBalance(List<Transaction> transactions) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(transaction.getAmount());
            } else if (transaction.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(transaction.getAmount());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);

        return new BalanceResponse(totalIncome, totalExpense, balance);
    }
}