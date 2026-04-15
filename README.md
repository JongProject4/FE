# 소아과 AI 어시스턴트 (AIYA)

아이의 건강을 위한 AI 기반 소아과 상담 파트너 — 모바일 퍼스트 웹앱

🔗 **배포 URL: https://pediatric-ai-beige.vercel.app**

---

## 주요 기능

- **소셜 로그인**: Google OAuth2 (백엔드 JWT 인증)
- **AI 채팅**: Claude Sonnet 기반, 스트리밍 응답
- **아이 프로필**: 복수 아이 관리 (이름, 생년월일, 성별, 체중, 알레르기)
- **개인화 상담**: 아이 데이터가 AI 컨텍스트에 자동 반영
- **이미지 첨부**: 피부 발진 등 사진 업로드
- **음성 입력**: Web Speech API
- **상담 기록**: 이전 대화 저장 및 조회
- **위험도 평가**: 낮음 / 중간 / 높음 자동 분류
- **FCM 푸시 알림**: Firebase Cloud Messaging
- **PWA 지원**: 홈 화면 추가 가능

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Auth | Google OAuth2 → JWT (Spring Boot 백엔드) |
| Backend | Spring Boot 3.5, Java 21, MySQL |
| AI | Anthropic Claude Sonnet (Streaming) |
| State | Zustand (persist) |
| Notifications | Firebase Cloud Messaging |
| Deploy | Vercel (Frontend), 백엔드 별도 |

---

## DB 구조

```
User          — 사용자 (소셜 로그인)
Child         — 아이 프로필 (User FK)
Consultation  — 상담 세션 (Child FK, 위험도, 카테고리)
ConsultationDetail — 채팅 메시지 (USER/AI role)
HealthLog     — 건강 기록 (체온, 체중, 증상 등)
Session       — JWT 세션
```

---

## 시작하기

### 1. 클론 & 의존성 설치

```bash
git clone <repo>
cd pediatric-ai-doctor
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 파일에 아래 값들 설정
```

필수 환경변수:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="32자 이상의 랜덤 문자열"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. OAuth 2.0 클라이언트 생성
3. 승인된 리디렉션 URI 추가: `http://localhost:3000/api/auth/callback/google`

### 4. Apple OAuth 설정

1. [Apple Developer](https://developer.apple.com) > Certificates > Identifiers
2. Services ID 생성 (`Sign in with Apple` 활성화)
3. 리턴 URL: `https://yourdomain.com/api/auth/callback/apple`
4. Private Key 다운로드

### 5. 카카오 OAuth 설정

1. [카카오 개발자](https://developers.kakao.com) > 내 애플리케이션
2. REST API 키 복사
3. Redirect URI: `http://localhost:3000/api/auth/callback/kakao`
4. 동의항목: `profile_nickname`, `account_email` 체크

### 6. DB 마이그레이션

```bash
npx prisma db push        # 개발용 (빠름)
# 또는
npx prisma migrate dev    # 프로덕션용 (마이그레이션 파일 생성)

npx prisma generate       # Prisma 클라이언트 생성
```

### 7. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 접속
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth 핸들러
│   │   ├── chat/                # AI 스트리밍 채팅 API
│   │   ├── children/            # 아이 CRUD API
│   │   ├── consultations/       # 상담 기록 API
│   │   ├── health-logs/         # 건강 기록 API
│   │   └── fcm/                 # FCM 토큰 저장 API
│   ├── login/                   # 소셜 로그인 페이지
│   ├── chat/                    # 메인 채팅 페이지
│   ├── child-setup/             # 아이 프로필 등록
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 루트 (리디렉트)
├── components/
│   ├── chat/
│   │   ├── ChatHeader.tsx       # 헤더 + 아이 선택
│   │   ├── MessageList.tsx      # 채팅 버블 목록
│   │   ├── ChatInput.tsx        # 입력창 (텍스트/이미지/음성)
│   │   ├── WelcomeScreen.tsx    # 첫 화면 (샘플 질문)
│   │   └── QuickChips.tsx       # 빠른 답변 칩
│   └── Providers.tsx            # Session + Toast
├── lib/
│   ├── auth.ts                  # NextAuth 설정
│   ├── prisma.ts                # Prisma 클라이언트
│   ├── ai.ts                    # Anthropic AI 유틸
│   ├── store.ts                 # Zustand 상태
│   └── firebase.ts              # FCM 클라이언트
└── prisma/
    └── schema.prisma            # DB 스키마
```

---

## Vercel 배포

```bash
npm install -g vercel
vercel

# 환경변수 Vercel 대시보드에서 설정
# Postgres 연결: Vercel Postgres 또는 Supabase 권장
```

---

## 주요 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/[...nextauth]` | 소셜 로그인 |
| GET | `/api/children` | 아이 목록 조회 |
| POST | `/api/children` | 아이 등록 |
| PATCH | `/api/children/:id` | 아이 수정 |
| POST | `/api/chat` | AI 채팅 (SSE 스트리밍) |
| GET | `/api/consultations` | 상담 기록 목록 |
| GET | `/api/consultations/:id` | 상담 상세 |
| GET/POST | `/api/health-logs` | 건강 기록 |
| POST | `/api/fcm` | FCM 토큰 저장 |

---

## 의료 면책 조항

이 서비스는 의료 전문가의 진료를 대체하지 않습니다.
응급 상황에서는 즉시 119에 연락하거나 가까운 응급실을 방문하세요.

---

## 라이선스

MIT
