package com.arsal.chamados_api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Setor {
    DIRETORIA, FINANCEIRO, RH, PROTOCOLO, TI, ADMINISTRATIVO, 
    JURÍDICO, SANEAMENTO, TRANSPORTE, COMUNICAÇÃO, RECUPERAÇÃO, 
    RECEPÇÃO, GABINETE, OUVIDORIA, TARIFAS, GÁS, ENERGIA;

    @JsonCreator
    public static Setor fromString(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        
        // Compara diretamente de forma flexível pelas letras maiúsculas
        for (Setor s : Setor.values()) {
            if (s.name().equalsIgnoreCase(value.trim())) {
                return s;
            }
        }
        // Fallback: se houver alguma variação sutil, tenta bater por aproximação
        return Setor.valueOf(value.trim().toUpperCase());
    }
}