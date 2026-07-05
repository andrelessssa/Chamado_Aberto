package com.arsal.chamados_api.services;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arsal.chamados_api.dtos.TecnicoDTO;
import com.arsal.chamados_api.models.Tecnico;
import com.arsal.chamados_api.repositories.TecnicoRepository;

@Service
public class TecnicoService {

    @Autowired
    private TecnicoRepository tecnicoRepository;

    public TecnicoDTO salvar(TecnicoDTO dto) {
        Tecnico tecnico = new Tecnico();
        tecnico.setNome(dto.nome());
        
        tecnico = tecnicoRepository.save(tecnico);
        return new TecnicoDTO(tecnico.getId(), tecnico.getNome());
    }
    public List<TecnicoDTO> listarTodos() {
        return tecnicoRepository.findAll().stream()
                .map(t -> new TecnicoDTO(t.getId(), t.getNome()))
                .collect(Collectors.toList());
    }
    public void deletar(Long id) {
        if (!tecnicoRepository.existsById(id)) {
            throw new RuntimeException("Técnico com ID " + id + " não encontrado!");
        }
        tecnicoRepository.deleteById(id);
    }
    
    
}
