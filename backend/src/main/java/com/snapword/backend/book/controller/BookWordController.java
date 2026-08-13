package com.snapword.backend.book.controller;

import com.snapword.backend.book.dto.AddBookWordRequest;
import com.snapword.backend.book.dto.BookWordDto;
import com.snapword.backend.book.service.BookWordService;
import com.snapword.backend.member.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books/{bookId}/words")
@RequiredArgsConstructor
public class BookWordController {

    private final BookWordService bookWordService;

    @PostMapping
    public ResponseEntity<BookWordDto> addWord(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId,
            @RequestBody AddBookWordRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookWordService.addWord(bookId, principal.getMemberId(), request));
    }

    @GetMapping
    public ResponseEntity<List<BookWordDto>> getWords(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId
    ) {
        return ResponseEntity.ok(bookWordService.getWords(bookId, principal.getMemberId()));
    }

    @DeleteMapping("/{bookWordId}")
    public ResponseEntity<Void> removeWord(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId,
            @PathVariable Long bookWordId
    ) {
        bookWordService.removeWord(bookId, bookWordId, principal.getMemberId());
        return ResponseEntity.noContent().build();
    }
}
