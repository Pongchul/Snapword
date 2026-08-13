package com.snapword.backend.book.exception;

public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(Long bookId) {
        super("단어장을 찾을 수 없습니다: " + bookId);
    }
}
