package com.snapword.backend.member.dto;

public record AuthResponse(
        String accessToken,
        MemberDto member
) {}
