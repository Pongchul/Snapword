package com.snapword.backend.book.exception;

public class ForbiddenBookAccessException extends RuntimeException {
    public ForbiddenBookAccessException(String message) {
        super(message);
    }
}
