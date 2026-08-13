package com.snapword.backend.word.exception;

public class WordLookupFailedException extends RuntimeException {
    public WordLookupFailedException(String text) {
        super("사전에서 단어를 찾을 수 없습니다: " + text);
    }
}
