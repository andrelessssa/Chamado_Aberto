package com.arsal.chamados_api.dtos;

import jakarta.validation.constraints.NotBlank;

public record TecnicoDTO(
    Long id,
    
   
    @NotBlank(message = "O nome é obrigatório")
    String nome,
    
    @NotBlank(message = "O CPF é obrigatório")
    String cpf
) {
    
}
