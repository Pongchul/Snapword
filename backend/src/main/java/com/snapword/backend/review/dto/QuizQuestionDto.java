package com.snapword.backend.review.dto;

import java.util.List;

public record QuizQuestionDto(
        Long bookWordId,
        String wordText,
        String pronunciation,
        List<String> choices,
        int correctIndex
) {}
