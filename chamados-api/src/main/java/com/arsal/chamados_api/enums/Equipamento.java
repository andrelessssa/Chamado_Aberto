package com.arsal.chamados_api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Equipamento {
    COMPUTADOR, NOTEBOOK, IMPRESSORA, MONITOR, REDE, SISTEMA, OUTRO;

    @JsonCreator
    public static Equipamento fromString(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        
        for (Equipamento e : Equipamento.values()) {
            if (e.name().equalsIgnoreCase(value.trim())) {
                return e;
            }
        }
        return Equipamento.valueOf(value.trim().toUpperCase());
    }
}