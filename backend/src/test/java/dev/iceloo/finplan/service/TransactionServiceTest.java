package dev.iceloo.finplan.service;

import dev.iceloo.finplan.dto.CreateTransactionRequest;
import dev.iceloo.finplan.entity.Category;
import dev.iceloo.finplan.entity.Transaction;
import dev.iceloo.finplan.entity.TransactionType;

import dev.iceloo.finplan.repository.CategoryRepository;
import dev.iceloo.finplan.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    @Test
    void createRejectsCategoryWithDifferentType() {
        TransactionRepository transactionRepository = mock(TransactionRepository.class);

        CategoryRepository categoryRepository = mock(CategoryRepository.class);

        TransactionService transactionService = new TransactionService(transactionRepository, categoryRepository);

        Category salaryCategory = new Category("Зарплата", TransactionType.INCOME);

        when(categoryRepository.findById(2L)).thenReturn(Optional.of(salaryCategory));

        CreateTransactionRequest request = new CreateTransactionRequest(new BigDecimal("1000.00"), TransactionType.EXPENSE, "Тестовый расход", LocalDate.of(2026, 9, 27), 2L);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> transactionService.create(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void createAcceptsCategoryWithMatchingType() {
        TransactionRepository transactionRepository = mock(TransactionRepository.class);

        CategoryRepository categoryRepository = mock(CategoryRepository.class);

        TransactionService transactionService = new TransactionService(transactionRepository, categoryRepository);

        Category productsCategory = new Category("Продукты", TransactionType.EXPENSE);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(productsCategory));

        CreateTransactionRequest request = new CreateTransactionRequest(new BigDecimal("500.00"), TransactionType.EXPENSE, "Тестовая покупка", LocalDate.of(2026, 9, 27), 1L);

        transactionService.create(request);

        verify(transactionRepository).save(argThat(transaction -> transaction.getType() == TransactionType.EXPENSE && transaction.getCategory() == productsCategory && transaction.getAmount().compareTo(new BigDecimal("500.00")) == 0));
    }

    @Test
    void findByMonthWithoutFiltersReturnsAllTransactions() {
        TransactionRepository transactionRepository = mock(TransactionRepository.class);

        CategoryRepository categoryRepository = mock(CategoryRepository.class);

        TransactionService service = new TransactionService(transactionRepository, categoryRepository);

        Transaction income = new Transaction(new BigDecimal("5000.00"), TransactionType.INCOME, "Зарплата", LocalDate.of(2026, 9, 27));

        Transaction expense = new Transaction(new BigDecimal("500.00"), TransactionType.EXPENSE, "Продукты", LocalDate.of(2026, 9, 27));

        when(transactionRepository.findByTransactionDateBetween(eq(LocalDate.of(2026, 9, 1)), eq(LocalDate.of(2026, 9, 30)), any(Sort.class))).thenReturn(List.of(income, expense));

        List<Transaction> result = service.findByMonth(2026, 9, null, null);

        assertEquals(List.of(income, expense), result);
    }

    @Test
    void findByMonthFiltersByCategory() {
        TransactionRepository transactionRepository = mock(TransactionRepository.class);

        CategoryRepository categoryRepository = mock(CategoryRepository.class);

        TransactionService service = new TransactionService(transactionRepository, categoryRepository);

        Category products = new Category("Продукты", TransactionType.EXPENSE);

        Transaction productsExpense = new Transaction(new BigDecimal("500.00"), TransactionType.EXPENSE, "Покупка продуктов", LocalDate.of(2026, 9, 27));
        productsExpense.setCategory(products);

        Transaction uncategorizedExpense = new Transaction(new BigDecimal("100.00"), TransactionType.EXPENSE, "Другой расход", LocalDate.of(2026, 9, 27));

        when(transactionRepository.findByTransactionDateBetween(any(LocalDate.class), any(LocalDate.class), any(Sort.class))).thenReturn(List.of(productsExpense, uncategorizedExpense));

        Category categoryWithId = mock(Category.class);
        when(categoryWithId.getId()).thenReturn(1L);
        productsExpense.setCategory(categoryWithId);

        List<Transaction> result = service.findByMonth(2026, 9, null, 1L);

        assertEquals(List.of(productsExpense), result);
    }

    @Test
    void findByMonthFiltersByTypeAndCategory() {
        TransactionRepository transactionRepository = mock(TransactionRepository.class);

        CategoryRepository categoryRepository = mock(CategoryRepository.class);

        TransactionService service = new TransactionService(transactionRepository, categoryRepository);

        Category products = mock(Category.class);
        when(products.getId()).thenReturn(1L);

        Transaction expense = new Transaction(new BigDecimal("500.00"), TransactionType.EXPENSE, "Продукты", LocalDate.of(2026, 9, 27));
        expense.setCategory(products);

        when(transactionRepository.findByTransactionDateBetween(any(LocalDate.class), any(LocalDate.class), any(Sort.class))).thenReturn(List.of(expense));

        List<Transaction> result = service.findByMonth(2026, 9, TransactionType.INCOME, 1L);

        assertEquals(List.of(), result);
    }
}