package com.snapword.backend.book.dto;

public record AddBookWordRequest(
        Long wordId,
        String note
) {}
