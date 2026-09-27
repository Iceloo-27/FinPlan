package dev.iceloo.finplan.service;

import dev.iceloo.finplan.dto.CreateTransactionRequest;
import dev.iceloo.finplan.entity.Category;
import dev.iceloo.finplan.entity.TransactionType;
import dev.iceloo.finplan.repository.CategoryRepository;
import dev.iceloo.finplan.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

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
}