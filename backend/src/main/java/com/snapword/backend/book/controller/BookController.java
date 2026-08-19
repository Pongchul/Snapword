package com.snapword.backend.book.controller;

import com.snapword.backend.book.dto.BookDto;
import com.snapword.backend.book.dto.BookMemberDto;
import com.snapword.backend.book.dto.CreateBookRequest;
import com.snapword.backend.book.dto.InviteCodeResponse;
import com.snapword.backend.book.dto.JoinBookRequest;
import com.snapword.backend.book.dto.UpdateMemberRoleRequest;
import com.snapword.backend.book.service.BookService;
import com.snapword.backend.member.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @PostMapping
    public ResponseEntity<BookDto> createBook(
            @AuthenticationPrincipal MemberPrincipal principal,
            @RequestBody CreateBookRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookService.createBook(principal.getMemberId(), request));
    }

    @GetMapping
    public ResponseEntity<List<BookDto>> getMyBooks(@AuthenticationPrincipal MemberPrincipal principal) {
        return ResponseEntity.ok(bookService.getMyBooks(principal.getMemberId()));
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<BookDto> getBook(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId
    ) {
        return ResponseEntity.ok(bookService.getBook(bookId, principal.getMemberId()));
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> deleteBook(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId
    ) {
        bookService.deleteBook(bookId, principal.getMemberId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{bookId}/invite-code")
    public ResponseEntity<InviteCodeResponse> generateInviteCode(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId
    ) {
        String code = bookService.generateInviteCode(bookId, principal.getMemberId());
        return ResponseEntity.ok(new InviteCodeResponse(code));
    }

    @PostMapping("/join")
    public ResponseEntity<BookDto> join(
            @AuthenticationPrincipal MemberPrincipal principal,
            @RequestBody JoinBookRequest request
    ) {
        return ResponseEntity.ok(bookService.joinByInviteCode(principal.getMemberId(), request.inviteCode()));
    }

    @GetMapping("/{bookId}/members")
    public ResponseEntity<List<BookMemberDto>> getMembers(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId
    ) {
        return ResponseEntity.ok(bookService.getMembers(bookId, principal.getMemberId()));
    }

    @PatchMapping("/{bookId}/members/{memberId}")
    public ResponseEntity<Void> updateMemberRole(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId,
            @PathVariable Long memberId,
            @RequestBody UpdateMemberRoleRequest request
    ) {
        bookService.updateMemberRole(bookId, principal.getMemberId(), memberId, request.role());
        return ResponseEntity.noContent().build();
    }
}
