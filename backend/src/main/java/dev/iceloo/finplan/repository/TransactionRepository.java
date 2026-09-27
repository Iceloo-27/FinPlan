package dev.iceloo.finplan.repository;

import dev.iceloo.finplan.entity.Transaction;
import dev.iceloo.finplan.entity.TransactionType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByTransactionDateBetween(LocalDate startDate, LocalDate endDate, Sort sort);
}