package dev.iceloo.finplan.service;

import dev.iceloo.finplan.dto.CreateTransactionRequest;
import dev.iceloo.finplan.entity.Transaction;
import dev.iceloo.finplan.entity.Category;
import dev.iceloo.finplan.entity.TransactionType;
import dev.iceloo.finplan.repository.TransactionRepository;
import dev.iceloo.finplan.repository.CategoryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public Transaction create(CreateTransactionRequest request) {
        Transaction transaction = new Transaction(request.amount(), request.type(), request.description(), request.transactionDate());
        transaction.setCategory(resolveCategory(request.categoryId(), request.type()));
        return transactionRepository.save(transaction);
    }

    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public Transaction findById(Long id) {
        return transactionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    private Category findCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));
    }

    @Transactional
    public Transaction update(Long id, CreateTransactionRequest request) {
        Transaction transaction = findById(id);
        transaction.setCategory(resolveCategory(request.categoryId(), request.type()));
        transaction.update(request.amount(), request.type(), request.description(), request.transactionDate());

        return transactionRepository.save(transaction);
    }

    public void delete(Long id) {
        Transaction transaction = findById(id);
        transactionRepository.delete(transaction);
    }

    private Category resolveCategory(Long categoryId, TransactionType transactionType) {
        Category category = findCategory(categoryId);

        if (category != null && category.getType() != transactionType) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction type must match category type");
        }

        return category;
    }
}