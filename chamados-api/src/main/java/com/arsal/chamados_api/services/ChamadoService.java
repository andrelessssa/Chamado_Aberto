package com.arsal.chamados_api.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.arsal.chamados_api.dtos.ChamadoDTO;

import com.arsal.chamados_api.repositories.ChamadoRepository;

public class ChamadoService {

    @Autowired
    private ChamadoRepository chamadoRepository;

   
    public List<ChamadoDTO> findAll() {
        return chamadoRepository.findAll().stream()
                .map(chamado -> new ChamadoDTO(
                        chamado.getId(), 
                        chamado.getTipoProblema(),   
                        chamado.getUsuarioNome(),    
                        chamado.getStatus() != null ? chamado.getStatus().name() : null, 
                        chamado.getTecnico() != null ? chamado.getTecnico().getId() : null
                ))
                .collect(Collectors.toList());
    }

    
}
