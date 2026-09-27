package dev.iceloo.finplan.service;

import dev.iceloo.finplan.dto.CreateCategoryRequest;
import dev.iceloo.finplan.entity.Category;
import dev.iceloo.finplan.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category create(CreateCategoryRequest request) {
        String name = request.name().trim();

        if (categoryRepository.existsByNameAndType(name, request.type())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }

        Category category = new Category(name, request.type());

        return categoryRepository.save(category);
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }
}