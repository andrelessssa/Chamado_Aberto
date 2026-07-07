package com.arsal.chamados_api.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arsal.chamados_api.dtos.ChamadoDTO;
import com.arsal.chamados_api.models.Chamado;
import com.arsal.chamados_api.models.Tecnico;
import com.arsal.chamados_api.repositories.ChamadoRepository;
import com.arsal.chamados_api.repositories.TecnicoRepository;

@Service
public class ChamadoService {

    @Autowired
    private ChamadoRepository chamadoRepository;

    @Autowired
    private TecnicoRepository tecnicoRepository;

    private final java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy, HH:mm");

      public ChamadoDTO create(ChamadoDTO dto) {
        Chamado chamado = new Chamado();
        
        chamado.setUsuarioNome(dto.usuarioNome());
        chamado.setTipoProblema(dto.descricao() != null ? dto.descricao() : dto.titulo()); 
        
        if (dto.setor() != null) {
            chamado.setSetor(com.arsal.chamados_api.enums.Setor.valueOf(dto.setor().toUpperCase().trim()));
        }
        if (dto.equipamento() != null) {
            chamado.setEquipamento(com.arsal.chamados_api.enums.Equipamento.valueOf(dto.equipamento().toUpperCase().trim()));
        }
        if (dto.prioridade() != null) {
            chamado.setPrioridade(com.arsal.chamados_api.enums.Prioridade.valueOf(dto.prioridade().toUpperCase().trim()));
        }
        
        // Configurações automáticas limpas 📅
        chamado.setStatus(com.arsal.chamados_api.enums.Status.ABERTO); 
        chamado.setTecnico(null); 
        chamado.setCriadoEm(LocalDateTime.now()); 
        chamado.setAtualizadoEm(LocalDateTime.now());
        
        chamado = chamadoRepository.save(chamado);
        
        return new ChamadoDTO(
                chamado.getId(),
                chamado.getUsuarioNome(),
                chamado.getSetor() != null ? chamado.getSetor().name() : null,
                chamado.getEquipamento() != null ? chamado.getEquipamento().name() : null,
                dto.titulo(),          
                chamado.getPrioridade() != null ? chamado.getPrioridade().name() : null,
                chamado.getTipoProblema(), 
                chamado.getStatus().name(),
                null,
                chamado.getCriadoEm().format(formatter)
        );
    }
    public List<ChamadoDTO> findAll() {
        return chamadoRepository.findAll().stream()
                .map(chamado -> new ChamadoDTO(
                        chamado.getId(), 
                        chamado.getUsuarioNome(),    
                        chamado.getSetor() != null ? chamado.getSetor().name() : null,
                        chamado.getEquipamento() != null ? chamado.getEquipamento().name() : null,
                        chamado.getTipoProblema(),   
                        chamado.getPrioridade() != null ? chamado.getPrioridade().name() : null,
                        chamado.getTipoProblema(), // Usa o tipoProblema aqui também para o texto do card
                        chamado.getStatus() != null ? chamado.getStatus().name() : null, 
                        chamado.getTecnico() != null ? chamado.getTecnico().getId() : null,
                        chamado.getCriadoEm() != null ? chamado.getCriadoEm().format(formatter) : null
                ))
                .collect(Collectors.toList());
    }

    

    //  1. REGRA DE ASSUMIR (VALIDAÇÃO ESTRITA) - 
    public ChamadoDTO assumirChamado(Long chamadoId, String nomeTecnico) {
        Chamado chamado = chamadoRepository.findById(chamadoId)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado!"));

        // Busca o nome exato vindo do select do front (Ex: "André Lessa")
        Tecnico tecnico = tecnicoRepository.findByNome(nomeTecnico)
                .orElseThrow(() -> new RuntimeException("Técnico '" + nomeTecnico + "' não cadastrado!"));

        chamado.setStatus(com.arsal.chamados_api.enums.Status.ANDAMENTO);
        chamado.setTecnico(tecnico);
        chamado.setAtualizadoEm(LocalDateTime.now());

        chamado = chamadoRepository.save(chamado);
        return mapearParaDTO(chamado);
    }

    // 2. REGRA DE FECHAMENTO - 
    public ChamadoDTO fecharChamado(Long chamadoId) {
        Chamado chamado = chamadoRepository.findById(chamadoId)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado!"));

        chamado.setStatus(com.arsal.chamados_api.enums.Status.FECHADO);
        chamado.setAtualizadoEm(LocalDateTime.now());

        chamado = chamadoRepository.save(chamado);
        return mapearParaDTO(chamado);
    }

    // 🔄 3. REGRA DE REABERTURA - Cartão 06
    public ChamadoDTO reabrirChamado(Long chamadoId) {
        Chamado chamado = chamadoRepository.findById(chamadoId)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado!"));

        chamado.setStatus(com.arsal.chamados_api.enums.Status.ABERTO);
        chamado.setTecnico(null); // Limpa o relacionamento com o técnico
        chamado.setAtualizadoEm(LocalDateTime.now());

        chamado = chamadoRepository.save(chamado);
        return mapearParaDTO(chamado);
    }

    //  4. MÉTODO AUXILIAR DE MAPEAMENTO
    private ChamadoDTO mapearParaDTO(Chamado chamado) {
        return new ChamadoDTO(
                chamado.getId(),
                chamado.getUsuarioNome(),
                chamado.getSetor() != null ? chamado.getSetor().name() : null,
                chamado.getEquipamento() != null ? chamado.getEquipamento().name() : null,
                chamado.getTipoProblema(),
                chamado.getPrioridade() != null ? chamado.getPrioridade().name() : null,
                chamado.getTipoProblema(),
                chamado.getStatus() != null ? chamado.getStatus().name() : null,
                chamado.getTecnico() != null ? chamado.getTecnico().getId() : null, // Pega o ID da Entity
                chamado.getCriadoEm() != null ? chamado.getCriadoEm().format(formatter) : null
        );
    }
}