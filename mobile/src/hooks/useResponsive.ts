import { useWindowDimensions } from 'react-native';

/** 이 너비 이상이면 태블릿/폴더블 펼침 화면으로 간주 (iPad mini 768dp, Fold 펼침 ~717dp 등을 포괄) */
const TABLET_BREAKPOINT = 600;

export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= TABLET_BREAKPOINT;
    const isLandscape = width > height;
    return { width, height, isTablet, isLandscape };
}
