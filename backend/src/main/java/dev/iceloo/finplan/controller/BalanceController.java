package dev.iceloo.finplan.controller;

import dev.iceloo.finplan.dto.BalanceResponse;
import dev.iceloo.finplan.service.BalanceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;


@RestController
@RequestMapping("/api/balance")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping
    public BalanceResponse getBalance() {
        return balanceService.getBalance();
    }

    @GetMapping("/monthly")
    public BalanceResponse getMonthlyBalance(@RequestParam int year, @RequestParam int month) {
        try {
            return balanceService.getMonthlyBalance(year, month);
        } catch (DateTimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid year or month");
        }
    }
}