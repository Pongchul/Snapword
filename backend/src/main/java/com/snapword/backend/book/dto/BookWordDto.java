package com.snapword.backend.book.dto;

import com.snapword.backend.word.dto.WordDto;

import java.time.LocalDateTime;

public record BookWordDto(
        Long id,
        WordDto word,
        String note,
        String addedByNickname,
        LocalDateTime createdAt
) {}
