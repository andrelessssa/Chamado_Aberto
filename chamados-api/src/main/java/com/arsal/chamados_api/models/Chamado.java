package com.arsal.chamados_api.models;

import java.time.LocalDateTime;

import com.arsal.chamados_api.enums.Equipamento;
import com.arsal.chamados_api.enums.Prioridade;
import com.arsal.chamados_api.enums.Setor;
import com.arsal.chamados_api.enums.Status;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Entity
@Table(name = "tb_chamado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuarioNome; 

    @Enumerated(EnumType.STRING)
    private Setor setor; 

    @Enumerated(EnumType.STRING)
    private Equipamento equipamento; 

    private String tipoProblema; 

    @Enumerated(EnumType.STRING)
    private Prioridade prioridade; 

    @Enumerated(EnumType.STRING)
    private Status status;
    
   
    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private Tecnico tecnico; 

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}