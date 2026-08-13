package com.snapword.backend.review.dto;

import java.time.LocalDateTime;

public record ReviewProgressDto(
        Long bookWordId,
        int repetitions,
        int intervalDays,
        double easeFactor,
        LocalDateTime nextReviewAt
) {}
