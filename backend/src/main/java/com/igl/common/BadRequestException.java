package com.igl.common;

/** Erro de entrada do usuário (vira HTTP 400 com a mensagem). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
