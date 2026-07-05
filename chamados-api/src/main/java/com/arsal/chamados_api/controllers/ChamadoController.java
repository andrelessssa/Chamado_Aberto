package com.arsal.chamados_api.controllers;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arsal.chamados_api.dtos.ChamadoDTO;
import com.arsal.chamados_api.services.ChamadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chamados")
@CrossOrigin(origins = "*")
public class ChamadoController {

    @Autowired
    private ChamadoService chamadoService;

    @PostMapping
    public ResponseEntity<ChamadoDTO> criarChamado(@RequestBody @Valid ChamadoDTO dto) {
        ChamadoDTO novoChamado = chamadoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoChamado);
    }
    @GetMapping
    public ResponseEntity<List<ChamadoDTO>> getAll() {
        List<ChamadoDTO> lista = chamadoService.findAll();
        return ResponseEntity.ok(lista);
    }
    @PutMapping("/{id}/assumir")
    public ResponseEntity<ChamadoDTO> assumir(@PathVariable Long id, @RequestBody String nomeTecnico) {
        // Remove as aspas extras que o Postman ou o JavaScript costumam enviar no formato raw text
        String nomeLimpo = nomeTecnico.replace("\"", "").trim();
        
        ChamadoDTO atualizado = chamadoService.assumirChamado(id, nomeLimpo);
        return ResponseEntity.ok(atualizado);
    }

    //  2. Rota para Fechar o Chamado (PUT)
    @PutMapping("/{id}/fechar")
    public ResponseEntity<ChamadoDTO> fechar(@PathVariable Long id) {
        ChamadoDTO atualizado = chamadoService.fecharChamado(id);
        return ResponseEntity.ok(atualizado);
    }

    // 3. Rota para Reabrir o Chamado (PUT)
    @PutMapping("/{id}/reabrir")
    public ResponseEntity<ChamadoDTO> reabrir(@PathVariable Long id) {
        ChamadoDTO atualizado = chamadoService.reabrirChamado(id);
        return ResponseEntity.ok(atualizado);
    }
}
