package dev.iceloo.finplan.controller;

import dev.iceloo.finplan.dto.CreateTransactionRequest;
import dev.iceloo.finplan.dto.TransactionResponse;
import dev.iceloo.finplan.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        return TransactionResponse.from(transactionService.create(request));
    }

    @GetMapping
    public List<TransactionResponse> getAllTransactions() {
        return transactionService.findAll().stream().map(TransactionResponse::from).toList();
    }

    @GetMapping("/{id}")
    public TransactionResponse getTransactionById(@PathVariable Long id) {
        return TransactionResponse.from(transactionService.findById(id));
    }

    @PutMapping("/{id}")
    public TransactionResponse updateTransaction(@PathVariable Long id, @Valid @RequestBody CreateTransactionRequest request) {
        return TransactionResponse.from(transactionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.delete(id);
    }

    @GetMapping("/monthly")
    public List<TransactionResponse> findByMonth(@RequestParam int year, @RequestParam int month) {
        try {
            return transactionService.findByMonth(year, month).stream().map(TransactionResponse::from).toList();
        } catch (DateTimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid year or month");
        }
    }
}