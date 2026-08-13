package com.snapword.backend.book.exception;

public class InvalidInviteCodeException extends RuntimeException {
    public InvalidInviteCodeException(String code) {
        super("유효하지 않은 초대코드입니다: " + code);
    }
}
