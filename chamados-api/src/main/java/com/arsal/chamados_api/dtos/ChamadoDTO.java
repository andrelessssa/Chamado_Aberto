package com.arsal.chamados_api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChamadoDTO(
    Long id,
    
    @NotBlank(message = "O título é obrigatório")
    String titulo,
    
    @NotBlank(message = "A descrição é obrigatória")
    String descricao,
    
    @NotBlank(message = "O status é obrigatório")
    String status,
    
    @NotNull(message = "O ID do técnico é obrigatório")
    Long tecnicoId
) {
    
}
