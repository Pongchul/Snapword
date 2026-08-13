# SnapWord

영단어를 사진으로 찍으면 OCR로 인식해서 개인 단어장에 저장하고, 간격 반복(SRS) 퀴즈로 복습하는 앱입니다.

## 구조

```
SnapWord/
  backend/   Spring Boot (Java 21) API 서버
  mobile/    React Native (bare CLI, iOS + Android)
```

## 주요 기능

- 회원가입 / 로그인 (JWT)
- 사진 촬영 → 온디바이스 ML Kit OCR로 단어 인식 → 외부 사전/번역 API 조회 → 단어장에 저장
- 단어장(북) 여러 개 생성, 초대코드로 다른 사람과 공유
- 간격 반복(SM-2 단순화) 기반 복습 퀴즈

## Backend

```bash
cd backend
./gradlew bootRun          # http://localhost:8080, 기본 프로파일 dev
./gradlew test
```

로컬 MySQL(`snapword` 스키마)이 필요합니다. `DB_USERNAME`/`DB_PASSWORD` 환경변수로 접속 정보를 override할 수 있습니다.
번역 API(`translation.api.base-url`/`key`)를 설정하지 않으면 한국어 뜻 없이 영영 사전 뜻만 저장됩니다.

API 문서: http://localhost:8080/swagger-ui.html

## Mobile

```bash
cd mobile
npm install

# iOS
bundle install && bundle exec pod install --project-directory=ios
npm run ios

# Android
npm run android
```

`src/apis/env.ts`의 `ENV.baseUrl`이 백엔드 주소를 가리킵니다(iOS 시뮬레이터는 `localhost`, Android 에뮬레이터는 `10.0.2.2` 사용).
