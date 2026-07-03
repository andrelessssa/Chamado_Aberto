package com.arsal.chamados_api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arsal.chamados_api.models.Tecnico;

public interface TecnicoRepository extends JpaRepository<Tecnico, Long> {
    
}
