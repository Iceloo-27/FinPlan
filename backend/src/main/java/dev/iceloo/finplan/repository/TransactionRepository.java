package dev.iceloo.finplan.repository;

import dev.iceloo.finplan.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}