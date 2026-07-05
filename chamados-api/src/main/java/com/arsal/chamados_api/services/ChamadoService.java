package com.arsal.chamados_api.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arsal.chamados_api.dtos.ChamadoDTO;
import com.arsal.chamados_api.models.Chamado;
import com.arsal.chamados_api.repositories.ChamadoRepository;

@Service
public class ChamadoService {

    @Autowired
    private ChamadoRepository chamadoRepository;

 public ChamadoDTO create(ChamadoDTO dto) {
    Chamado chamado = new Chamado();
    
    
    chamado.setUsuarioNome(dto.descricao()); // Pega o que está vindo no campo 'descricao'
    chamado.setTipoProblema(dto.titulo());   // Pega o que está vindo no campo 'titulo'
    
    // 📋 REGRAS AUTOMÁTICAS DE RETAGUARDA (Forçadas pelo Backend)
    chamado.setStatus(com.arsal.chamados_api.enums.Status.ABERTO); 
    chamado.setTecnico(null); 
    chamado.setCriadoEm(LocalDateTime.now()); 
    chamado.setAtualizadoEm(LocalDateTime.now());
    
    chamado = chamadoRepository.save(chamado);
    
    return new ChamadoDTO(
            chamado.getId(), 
            chamado.getTipoProblema(), 
            chamado.getUsuarioNome(), 
            chamado.getStatus().name(), 
            null
    );
}


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
