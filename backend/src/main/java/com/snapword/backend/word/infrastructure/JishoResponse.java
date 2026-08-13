package com.snapword.backend.word.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JishoResponse(List<JishoApiEntry> data) {}
