package com.igl.image;

import com.igl.common.BadRequestException;

public class InvalidImageException extends BadRequestException {
    public InvalidImageException(String message) {
        super(message);
    }
}
