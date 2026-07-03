package com.arsal.chamados_api.services;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.arsal.chamados_api.models.Tecnico;
import com.arsal.chamados_api.repositories.TecnicoRepository;

public class TecnicoService {

    @Autowired
    private TecnicoRepository tecnicoRepository;

    public List<Tecnico> findAll() {
        return tecnicoRepository.findAll();
    }
    
    
}
