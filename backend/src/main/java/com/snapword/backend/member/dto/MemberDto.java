package com.snapword.backend.member.dto;

public record MemberDto(
        Long id,
        String email,
        String nickname
) {}
