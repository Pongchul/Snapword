package com.snapword.backend.book.dto;

import com.snapword.backend.book.domain.BookRole;

public record BookMemberDto(
        Long memberId,
        String nickname,
        String email,
        BookRole role
) {}
