package com.snapword.backend.book.domain;

public enum BookRole {
    OWNER,
    EDITOR,
    VIEWER;

    public boolean canEdit() {
        return this == OWNER || this == EDITOR;
    }
}
