import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
    | 'camera'
    | 'brain'
    | 'share-2'
    | 'keyboard'
    | 'book'
    | 'book-open'
    | 'pencil'
    | 'volume-2'
    | 'trash-2'
    | 'x'
    | 'check'
    | 'flame'
    | 'user'
    | 'trophy'
    | 'party-popper'
    | 'circle-check';

type Props = {
    name: IconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
};

/**
 * 아이콘 도형은 Lucide(MIT 라이선스, lucide.dev)에서 그대로 가져온 path 데이터다.
 * 아이콘 하나하나를 개별 SVG 패키지 대신 이 컴포넌트에 필요한 것만 직접 넣어서
 * 불필요한 의존성 없이 react-native-svg만으로 렌더링한다.
 */
const ICONS: Record<IconName, React.ReactNode> = {
    camera: (
        <>
            <Path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
            <Circle cx="12" cy="13" r="3" />
        </>
    ),
    brain: (
        <>
            <Path d="M12 18V5" />
            <Path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
            <Path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
            <Path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
            <Path d="M18 18a4 4 0 0 0 2-7.464" />
            <Path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
            <Path d="M6 18a4 4 0 0 1-2-7.464" />
            <Path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
        </>
    ),
    'share-2': (
        <>
            <Circle cx="18" cy="5" r="3" />
            <Circle cx="6" cy="12" r="3" />
            <Circle cx="18" cy="19" r="3" />
            <Line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <Line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
        </>
    ),
    keyboard: (
        <>
            <Path d="M10 8h.01" />
            <Path d="M12 12h.01" />
            <Path d="M14 8h.01" />
            <Path d="M16 12h.01" />
            <Path d="M18 8h.01" />
            <Path d="M6 8h.01" />
            <Path d="M7 16h10" />
            <Path d="M8 12h.01" />
            <Rect width="20" height="16" x="2" y="4" rx="2" />
        </>
    ),
    book: <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />,
    'book-open': (
        <>
            <Path d="M12 5v16" />
            <Path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
        </>
    ),
    pencil: (
        <>
            <Path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <Path d="m15 5 4 4" />
        </>
    ),
    'volume-2': (
        <>
            <Path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
            <Path d="M16 9a5 5 0 0 1 0 6" />
            <Path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
        </>
    ),
    'trash-2': (
        <>
            <Path d="M10 11v6" />
            <Path d="M14 11v6" />
            <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <Path d="M3 6h18" />
            <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </>
    ),
    x: (
        <>
            <Path d="M18 6 6 18" />
            <Path d="m6 6 12 12" />
        </>
    ),
    check: <Path d="M20 6 9 17l-5-5" />,
    flame: <Path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />,
    user: (
        <>
            <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
        </>
    ),
    trophy: (
        <>
            <Path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2" />
            <Path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2" />
            <Path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3" />
            <Path d="M4 22h16" />
            <Path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
            <Path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" />
        </>
    ),
    'party-popper': (
        <>
            <Path d="M5.8 11.3 2 22l10.7-3.79" />
            <Path d="M4 3h.01" />
            <Path d="M22 8h.01" />
            <Path d="M15 2h.01" />
            <Path d="M22 20h.01" />
            <Path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
            <Path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" />
            <Path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" />
            <Path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
        </>
    ),
    'circle-check': (
        <>
            <Circle cx="12" cy="12" r="10" />
            <Path d="m9 12 2 2 4-4" />
        </>
    ),
};

export default function Icon({ name, size = 20, color = colors.textSub, strokeWidth = 2 }: Props) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {ICONS[name]}
        </Svg>
    );
}
