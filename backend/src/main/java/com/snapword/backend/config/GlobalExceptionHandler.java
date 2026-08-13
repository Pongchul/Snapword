package com.snapword.backend.config;

import com.snapword.backend.book.exception.BookNotFoundException;
import com.snapword.backend.book.exception.ForbiddenBookAccessException;
import com.snapword.backend.book.exception.InvalidInviteCodeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 컨트롤러에서 별도로 처리하지 않은 예외가 클라이언트에 스택트레이스/내부 클래스명 등을
 * 노출하지 않도록 하는 최종 방어선. 컨트롤러에 개별 @ExceptionHandler가 있으면 그쪽이 우선 적용된다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<String> handleBookNotFound(BookNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(ForbiddenBookAccessException.class)
    public ResponseEntity<String> handleForbiddenBookAccess(ForbiddenBookAccessException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    @ExceptionHandler(InvalidInviteCodeException.class)
    public ResponseEntity<String> handleInvalidInviteCode(InvalidInviteCodeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnexpected(Exception e) {
        log.error("처리되지 않은 예외 발생", e);
        return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다.");
    }
}
