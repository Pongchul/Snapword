import { Platform } from 'react-native';

// 로컬 백엔드 개발 서버 기본값.
// - iOS 시뮬레이터: localhost가 맥 호스트를 그대로 가리킴
// - Android 에뮬레이터: 10.0.2.2가 호스트 머신의 localhost를 가리킴 (에뮬레이터 자체 루프백 주소는 사용 불가)
// - 실기기 테스트 시에는 같은 네트워크의 맥 IP로 바꿔야 함
// 실기기는 `adb reverse tcp:8080 tcp:8080`으로 포워딩해서 localhost로 접근한다.
const DEV_BASE_URL = Platform.select({
    android: 'http://localhost:8080',
    default: 'http://localhost:8080',
});

export const ENV = {
    baseUrl: DEV_BASE_URL,
} as const;
