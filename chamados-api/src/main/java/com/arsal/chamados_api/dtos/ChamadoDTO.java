package com.arsal.chamados_api.dtos;

import jakarta.validation.constraints.NotBlank;

public record ChamadoDTO(
    Long id,
    
    @NotBlank(message = "O título é obrigatório")
    String titulo,
    
    @NotBlank(message = "A descrição é obrigatória")
    String descricao,
    
 
    String status,
    
    Long tecnicoId
) {
    
}