package com.arsal.chamados_api.dtos;

import jakarta.validation.constraints.NotBlank;


public record TecnicoDTO(
    Long id,
    @NotBlank(message = "O nome do técnico é obrigatório") String nome
) {}