import React from 'react';
import { View, ViewProps } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

type Props = ViewProps & {
    maxWidth?: number;
};

/**
 * 태블릿/폴더블 펼침처럼 화면이 넓을 때 내용을 가운데 정렬된 고정 최대너비로 제한한다.
 * 폰 너비에서는 아무 영향 없이 기존 style 그대로 렌더링된다.
 */
export default function ResponsiveContainer({ style, maxWidth = 560, children, ...rest }: Props) {
    const { isTablet } = useResponsive();

    return (
        <View
            style={[style, isTablet && { maxWidth, width: '100%', alignSelf: 'center' }]}
            {...rest}
        >
            {children}
        </View>
    );
}
