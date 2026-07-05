package com.arsal.chamados_api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arsal.chamados_api.dtos.TecnicoDTO;
import com.arsal.chamados_api.services.TecnicoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tecnicos")
@CrossOrigin(origins = "https://andrelessssa.github.io")
public class TecnicoController {

    @Autowired
    private TecnicoService tecnicoService;

    @PostMapping
    public ResponseEntity<TecnicoDTO> cadastrar(@Valid @RequestBody TecnicoDTO dto) {
        TecnicoDTO novoTecnico = tecnicoService.salvar(dto);
        return ResponseEntity.ok(novoTecnico);
    }

    @GetMapping
    public ResponseEntity<List<TecnicoDTO>> listar() {
        return ResponseEntity.ok(tecnicoService.listarTodos());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        tecnicoService.deletar(id);
        return ResponseEntity.noContent().build(); 
    }

}
