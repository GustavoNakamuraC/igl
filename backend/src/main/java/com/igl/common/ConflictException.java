package com.igl.common;

/** Operação conflita com dados existentes (vira HTTP 409). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
