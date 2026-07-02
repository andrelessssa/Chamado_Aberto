package com.arsal.chamados_api.models;

import com.arsal.chamados_api.enums.Equipamento;
import com.arsal.chamados_api.enums.Prioridade;
import com.arsal.chamados_api.enums.Status;
import com.arsal.chamados_api.enums.Setor;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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