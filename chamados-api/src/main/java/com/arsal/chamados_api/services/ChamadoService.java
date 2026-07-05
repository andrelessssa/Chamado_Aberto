package com.arsal.chamados_api.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arsal.chamados_api.dtos.ChamadoDTO;
import com.arsal.chamados_api.models.Chamado;
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
        chamado.setTipoProblema(dto.titulo()); 
        
        
        if (dto.setor() != null) chamado.setSetor(com.arsal.chamados_api.enums.Setor.valueOf(dto.setor().toUpperCase()));
        if (dto.equipamento() != null) chamado.setEquipamento(com.arsal.chamados_api.enums.Equipamento.valueOf(dto.equipamento().toUpperCase()));
        if (dto.prioridade() != null) chamado.setPrioridade(com.arsal.chamados_api.enums.Prioridade.valueOf(dto.prioridade().toUpperCase()));
        
        // 📋 REGRAS DE RETAGUARDA (O Java gera automático!)
        chamado.setStatus(com.arsal.chamados_api.enums.Status.ABERTO); 
        chamado.setTecnico(null); 
        chamado.setCriadoEm(LocalDateTime.now()); 
        chamado.setAtualizadoEm(LocalDateTime.now());
        
        chamado = chamadoRepository.save(chamado);
        
        // Retorna o DTO passando o tipoProblema tanto para o titulo quanto para a descricao do card
        return new ChamadoDTO(
                chamado.getId(),
                chamado.getUsuarioNome(),
                chamado.getSetor() != null ? chamado.getSetor().name() : null,
                chamado.getEquipamento() != null ? chamado.getEquipamento().name() : null,
                chamado.getTipoProblema(), // Alimenta o titulo do card
                chamado.getPrioridade() != null ? chamado.getPrioridade().name() : null,
                chamado.getTipoProblema(), // Alimenta a descricao curta do card
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

    public ChamadoDTO assumirChamado(Long chamadoId, String nomeTecnico) {
    // 1. Busca o chamado no banco. Se não achar, lança um erro.
    Chamado chamado = chamadoRepository.findById(chamadoId)
            .orElseThrow(() -> new RuntimeException("Chamado não encontrado!"));

    // 2. Busca o técnico pelo nome. Se não existir, cria um novo na hora! 🦾
    com.arsal.chamados_api.models.Tecnico tecnico = tecnicoRepository.findByNome(nomeTecnico)
            .orElseGet(() -> {
                com.arsal.chamados_api.models.Tecnico novoTecnico = new com.arsal.chamados_api.models.Tecnico();
                novoTecnico.setNome(nomeTecnico);
                return tecnicoRepository.save(novoTecnico);
            });

    // 3. Aplica as regras de negócio do Cartão 06 📊
    chamado.setStatus(com.arsal.chamados_api.enums.Status.ANDAMENTO); // Muda para ANDAMENTO
    chamado.setTecnico(tecnico); // Vincula o técnico encontrado/criado
    chamado.setAtualizadoEm(LocalDateTime.now()); // Atualiza o carimbo de modificação

    // 4. Salva as alterações no Postgres do Mac
    chamado = chamadoRepository.save(chamado);

    // 5. Retorna o DTO atualizado para o Angular pintar o card de azul/andamento
    return new ChamadoDTO(
            chamado.getId(),
            chamado.getUsuarioNome(),
            chamado.getSetor() != null ? chamado.getSetor().name() : null,
            chamado.getEquipamento() != null ? chamado.getEquipamento().name() : null,
            chamado.getTipoProblema(),
            chamado.getPrioridade() != null ? chamado.getPrioridade().name() : null,
            chamado.getTipoProblema(),
            chamado.getStatus().name(),
            chamado.getTecnico().getId(), // Agora o ID do técnico vai preenchido!
            chamado.getCriadoEm().format(formatter)
    );
}
}