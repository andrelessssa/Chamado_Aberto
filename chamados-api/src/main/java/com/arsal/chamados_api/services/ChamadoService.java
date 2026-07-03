package com.arsal.chamados_api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.arsal.chamados_api.models.Chamado;
import com.arsal.chamados_api.repositories.ChamadoRepository;

public class ChamadoService {

    @Autowired
    private ChamadoRepository chamadoRepository;

    public List<Chamado> findAll() {
        return chamadoRepository.findAll();
    }
    


    
}
