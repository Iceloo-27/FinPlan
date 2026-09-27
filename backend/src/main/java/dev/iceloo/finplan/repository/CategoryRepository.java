package dev.iceloo.finplan.repository;

import dev.iceloo.finplan.entity.Category;
import dev.iceloo.finplan.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameAndType(String name, TransactionType type);
}