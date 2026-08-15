package com.snapword.backend.review.controller;

import com.snapword.backend.member.security.MemberPrincipal;
import com.snapword.backend.review.dto.QuizQuestionDto;
import com.snapword.backend.review.dto.ReviewActivityDto;
import com.snapword.backend.review.dto.ReviewProgressDto;
import com.snapword.backend.review.dto.ReviewResultRequest;
import com.snapword.backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/v1/books/{bookId}/review/queue")
    public ResponseEntity<List<QuizQuestionDto>> getQueue(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookId
    ) {
        return ResponseEntity.ok(reviewService.getQueue(bookId, principal.getMemberId()));
    }

    @PostMapping("/api/v1/review/{bookWordId}/result")
    public ResponseEntity<ReviewProgressDto> submitResult(
            @AuthenticationPrincipal MemberPrincipal principal,
            @PathVariable Long bookWordId,
            @RequestBody ReviewResultRequest request
    ) {
        return ResponseEntity.ok(reviewService.submitResult(bookWordId, principal.getMemberId(), request.correct()));
    }

    /** 잔디(히트맵) 표시용 — 최근 days일간의 일별 복습 활동 */
    @GetMapping("/api/v1/review/activity")
    public ResponseEntity<List<ReviewActivityDto>> getActivity(
            @AuthenticationPrincipal MemberPrincipal principal,
            @RequestParam(defaultValue = "371") int days
    ) {
        return ResponseEntity.ok(reviewService.getActivity(principal.getMemberId(), days));
    }
}
