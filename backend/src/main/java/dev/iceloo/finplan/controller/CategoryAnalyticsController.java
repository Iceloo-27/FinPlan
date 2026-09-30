package dev.iceloo.finplan.controller;

import dev.iceloo.finplan.dto.CategoryExpenseResponse;
import dev.iceloo.finplan.service.CategoryAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class CategoryAnalyticsController {

    private final CategoryAnalyticsService categoryAnalyticsService;

    public CategoryAnalyticsController(CategoryAnalyticsService categoryAnalyticsService) {
        this.categoryAnalyticsService = categoryAnalyticsService;
    }

    @GetMapping("/expenses-by-category")
    public List<CategoryExpenseResponse> getAllTimeExpenses() {
        return categoryAnalyticsService.getAllTimeExpenses();
    }

    @GetMapping("/expenses-by-category/monthly")
    public List<CategoryExpenseResponse> getMonthlyExpenses(@RequestParam int year, @RequestParam int month) {
        try {
            return categoryAnalyticsService.getMonthlyExpenses(year, month);
        } catch (DateTimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid year or month");
        }
    }
}