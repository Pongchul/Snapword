// 토스 앱 스타일을 참고한 컬러/타이포/스페이싱 토큰
export const colors = {
    primary: '#3182F6',
    primaryLight: '#EAF2FF',
    primaryDark: '#1B64DA',

    success: '#00C471',
    successLight: '#E7F9F1',
    danger: '#F04452',
    dangerLight: '#FDECEE',

    textMain: '#191F28',
    textSub: '#4E5968',
    textPlaceholder: '#8B95A1',
    textDisabled: '#B0B8C1',

    background: '#FFFFFF',
    surface: '#F2F4F6',
    surfaceAlt: '#F9FAFB',
    border: '#E5E8EB',
    white: '#FFFFFF',
    black: '#000000',
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999,
} as const;

export const typography = {
    display: { fontSize: 32, fontWeight: '800' as const, color: colors.textMain, letterSpacing: -0.5 },
    title: { fontSize: 26, fontWeight: '800' as const, color: colors.textMain, letterSpacing: -0.3 },
    heading: { fontSize: 20, fontWeight: '700' as const, color: colors.textMain },
    subheading: { fontSize: 16, fontWeight: '700' as const, color: colors.textMain },
    body: { fontSize: 15, fontWeight: '400' as const, color: colors.textMain },
    label: { fontSize: 13, fontWeight: '700' as const, color: colors.textSub },
    caption: { fontSize: 13, fontWeight: '500' as const, color: colors.textSub },
    small: { fontSize: 12, fontWeight: '500' as const, color: colors.textPlaceholder },
};

export const shadow = {
    card: {
        shadowColor: '#191F28',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },
};
