package com.igl.map;

public class UnknownMapException extends RuntimeException {
    public UnknownMapException(String slug) {
        super("Mapa desconhecido: " + slug);
    }
}
