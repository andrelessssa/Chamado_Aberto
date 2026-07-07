package com.arsal.chamados_api.controllers;

import java.util.Arrays;
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
import com.arsal.chamados_api.enums.Equipamento;
import com.arsal.chamados_api.services.ChamadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chamados")
@CrossOrigin(origins = "*")
public class ChamadoController {

    @Autowired
    private ChamadoService chamadoService;

    @GetMapping("/setores")
    public ResponseEntity<List<String>> listarSetores() {
        List<String> setores = java.util.Arrays.stream(com.arsal.chamados_api.enums.Setor.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(setores);
    }

    @PostMapping
    public ResponseEntity<ChamadoDTO> criarChamado(@RequestBody @Valid ChamadoDTO dto) {
        // 🌟 Corrigido para o padrão de Record do Java (sem o "get")!
        System.out.println("Recebendo chamado do front: " + dto.usuarioNome() + " - Setor: " + dto.setor());
        
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
        String nomeLimpo = nomeTecnico.replace("\"", "").trim();
        ChamadoDTO updated = chamadoService.assumirChamado(id, nomeLimpo);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/fechar")
    public ResponseEntity<ChamadoDTO> fechar(@PathVariable Long id) {
        ChamadoDTO atualizado = chamadoService.fecharChamado(id);
        return ResponseEntity.ok(atualizado);
    }

    @PutMapping("/{id}/reabrir")
    public ResponseEntity<ChamadoDTO> reabrir(@PathVariable Long id) {
        ChamadoDTO atualizado = chamadoService.reabrirChamado(id);
        return ResponseEntity.ok(atualizado);
    }

    @GetMapping("/equipamentos")
    public ResponseEntity<List<Equipamento>> listarEquipamentos() {
        return ResponseEntity.ok(Arrays.asList(Equipamento.values()));
    }

    // 🌟 ROTA QUE ESTAVA FALTANDO PARA CORRIGIR O 404 DO CONSOLE!
    @GetMapping("/tecnicos")
    public ResponseEntity<List<String>> listarTecnicos() {
        // Retorna os nomes dos técnicos da TI da ARSAL ativos para preencher o modal
        List<String> tecnicos = Arrays.asList("André", "Suporte TI");
        return ResponseEntity.ok(tecnicos);
    }

    @GetMapping("/abrir")
    public ResponseEntity<Void> redirecionarParaOFront() {
        return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .header(org.springframework.http.HttpHeaders.LOCATION, "/index.html")
                .build();
    }
}