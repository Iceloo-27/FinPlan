package dev.iceloo.finplan.controller;

import dev.iceloo.finplan.dto.BalanceResponse;
import dev.iceloo.finplan.service.BalanceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}