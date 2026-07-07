package com.arsal.chamados_api.dtos;

import jakarta.validation.constraints.NotBlank;


public record ChamadoDTO(
    Long id,
    
    @NotBlank(message = "O nome do usuário é obrigatório")
    String usuarioNome,
    
    @NotBlank(message = "O setor é obrigatório")
    String setor,
    
    @NotBlank(message = "O equipamento é obrigatório")
    String equipamento,
    
    @NotBlank(message = "O tipo de problema é obrigatório")
    String titulo, // mapeia para tipoProblema
    
    @NotBlank(message = "A prioridade é obrigatória")
    String prioridade,
    
    @NotBlank(message = "A descrição detalhada é obrigatória")
    String descricao,
    
    String status,
    Long tecnicoId,
    String criadoEm // Enviamos formatado para o rodapé do card 📅
) {}