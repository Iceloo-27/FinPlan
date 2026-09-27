package dev.iceloo.finplan.dto;

import dev.iceloo.finplan.entity.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @NotNull
        TransactionType type
) {
}