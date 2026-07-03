package com.arsal.chamados_api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arsal.chamados_api.models.Chamado;

public interface ChamadoRepository extends JpaRepository<Chamado, Long> {
    
}
