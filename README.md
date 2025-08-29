# carenet

# Carenet 프론트엔드 Product Requirements Document (PRD)

## 프론트엔드 기술스택

- Next.js, Tailwind CSS v4, Shadcn UI, zustand, react-query, react-icons (io5,io4), recharts

기술 스택: Next.js, Tailwind CSS v4, Shadcn UI, zustand, react-query, react-icons (io5,io4), recharts

패키지 관리는 pnpm을 사용하며, shadcn 컴포넌트는 `pnpm dlx shadcn@latest add <component-name>` 명령어로 설치합니다.

## 1. 목적

홈 CCTV 기반 노인 낙상‧욕창 모니터링 시스템 **Carenet**의 프론트엔드 애플리케이션 요구사항을 정의한다. 대상 범위는 웹 클라이언트(Next.js + TailwindCSS + Shadcn UI)이다. 백엔드 API·모델 구현은 별도 문서에서 다루고, 본 문서는 UI/UX, 데이터 흐름, 기능 명세에 집중한다.

## 2. 주요 목표

- 병동/가정 단위 대시보드에서 낙상·욕창 이벤트를 실시간 모니터링
- 이벤트 세부 영상(클립·스크린샷) 재생 및 확인 후 알림 상태 관리
- 간호사·관리자용 권한 기반 사용자 관리 UI 제공
- CCTV 라이브 스트림 및 병실별 뷰 구성
- 반응형 UI로 데스크톱(1차)·태블릿(2차) 지원

## 3. 사용자 유형 & 핵심 시나리오

| 역할               | 주요 동선                                    | 권한                                                       |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------- |
| **슈퍼 관리자**    | 병원 관리 → 계정 승인                        | 모든 병원 데이터 접근 및 병원 생성/삭제, 사용자 롤 관리    |
| **병원 관리자**    | 로그인 → 대시보드 → 관리자 페이지(병원 설정) | 해당 병원(테넌트) 범위 내 읽기/쓰기, 소속 사용자 승인·편집 |
| **간호사**         | 로그인 → 대시보드 → 이벤트 세부 페이지       | 병원 데이터 읽기, 이벤트 확인 표시                         |
| **관제요원(옵션)** | CCTV 전체 보기 → 특정 병실 확대              | 읽기 전용                                                  |

### 멀티 테넌시 원칙

- **데이터 격리**: 모든 API는 `X-Hospital-ID` 또는 JWT claim을 이용해 테넌트 범위를 강제한다.
- **도메인 매핑(선택)**: `hospital-a.carenet.app`, `hospital-b.carenet.app` 서브도메인 분리 고려.
- **슈퍼 관리자**만 다중 병원을 조회·관리할 수 있다.

### 핵심 시나리오(보완)

1. **새 병원 온보딩**

   1. 슈퍼 관리자가 Admin > Hospitals 탭에서 병원 레코드 생성(이름, 주소, 라이선스 만료일 등).
   2. 병원 관리자 초대 이메일 발송.

2. **병원별 계정 승인**

   1. 간호사 회원가입 → 병원 관리자 대기열 확인.
   2. 승인 시 JWT에 병원 ID와 역할이 포함되어 발급된다.

## 4. 정보 구조 & 네비게이션 정보 구조 & 네비게이션

```
┌──────────────┐
│  Global Nav  │  (Logo | Dashboard | CCTV | Admin | Profile)
└──────────────┘
      │
      ├─ Dashboard (/dashboard)
      │   ├─ KPI Cards (실시간 카운트)
      │   ├─ Heatmap / Bar chart (기간 선택)
      │   └─ Alert Timeline
      │
      ├─ CCTV View (/cctv)
      │   ├─ 층·병실 그리드
      │   └─ Modal‑based 확대 및 라이브 스트림
      │
      ├─ Event Detail (/event/:id)
      │   ├─ Video Clip Player
      │   ├─ Snapshot Gallery
      │   └─ 상태 변경 버튼(미확인→확인)
      │
      └─ Admin (/admin)
          ├─ 계정 승인 테이블
          └─ 병상 메타 데이터 편집
```

## 5. 페이지별 기능 요구사항

### 5.1 Dashboard

- **KPI 카드**: 낙상(예측/발생), 욕창(예측/발생), 커튼, 침대비움, 병상없음, 난간주의 실시간 개수 표시
- **필터 바**: 기간(실시간/1시간/24시간/7일), 층, 병실 다중 선택
- **차트**

  - Bar chart: 요일·시간대별 이벤트 분포
  - Line chart: 일자별 이벤트 추세

- **Alert Timeline**: WebSocket 실시간 스트림, 미확인 이벤트 강조
- **성능 목표**: 1초 이내 KPI 업데이트, 3초 이내 차트 리렌더

### 5.2 CCTV View

- 병원(층)·가정(단일) 모드 전환 지원
- 각 CCTV 썸네일에 상태 배지(정상/경고/위험)
- 썸네일 클릭 시 모달로 1280×720 라이브 스트림 재생
- Latency 목표: < 2초(웹RTC or HLS Low‑Latency)

### 5.3 Event Detail

- Video.js 플레이어로 S3 클립 스트림 재생 (HLS)
- 캡처 썸네일 그리드(추가 메타: 타임스탬프, 이벤트 타입)
- 확인/미확인 토글, DB 업데이트 후 Dashboard KPI 실시간 반영

### 5.4 Admin

- **병원 관리(Hospitals 탭)**

  - 병원 목록, 라이선스 상태, 활성/비활성 토글
  - 병원 세부 페이지: 기본 정보, 연락처, 계약 만료일, 병상 수 요약
  - 병원 삭제 시 데이터 보존 정책(보관 90일 후 영구 삭제)

- **계정 승인(Users 탭)**

  - 병원별 필터, 역할 지정(간호사·관제·병원 관리자)

- **병상 관리(Beds 탭)**

  - 병원 스코프 내 침대 CRUD, 폴리곤 좌표 JSON 편집

## 6. 컴포넌트 설계 가이드 컴포넌트 설계 가이드

- shadcn/ui Card, Dialog, Button 우선 사용
- KPI 카드: `Card` + `Progress`(애니메이션)
- 차트: `recharts` LineChart, BarChart
- 테이블: Shadcn Table + 서버사이드 Pagination
- 전역 상태: React Query + Zod 스키마 검증

## 7. 인터랙션 & 애니메이션

- 프레임 진입 시 Framer Motion `fade‑in(up)`
- KPI 카드 수치 변화 시 카운트‑업 애니메이션
- Event Detail 클립 로딩 스켈레톤 제공

## 8. API 계약(초안)

| 메서드 | 엔드포인트                                         | 설명                        |
| ------ | -------------------------------------------------- | --------------------------- |
| GET    | `/api/hospitals`                                   | (슈퍼) 병원 목록 조회       |
| POST   | `/api/hospitals`                                   | 병원 생성                   |
| GET    | `/api/hospitals/:id`                               | 병원 상세                   |
| PATCH  | `/api/hospitals/:id`                               | 병원 정보 수정/활성화       |
| GET    | `/api/events?hospital_id=&type=&status=&from=&to=` | 이벤트 목록 (테넌트 스코프) |
| GET    | `/api/events/:id`                                  | 단일 이벤트                 |
| PATCH  | `/api/events/:id/status`                           | 이벤트 확인 상태 변경       |
| GET    | `/api/cctv/streams?hospital_id=&floor=`            | CCTV 스트림 URL             |
| POST   | `/api/admin/users/approve`                         | (병원) 가입 승인            |
| GET    | `/api/admin/users?hospital_id=`                    | 병원 사용자 목록            |
| GET    | `/api/metadata/beds?hospital_id=`                  | 침대 메타                   |
| PUT    | `/api/metadata/beds/:id`                           | 침대 메타 업데이트          |

**보안**: 모든 요청은 JWT Bearer 토큰 필요, 토큰 클레임에 `hospital_id`와 `role` 포함.

## 9. 성능 & 품질 기준 성능 & 품질 기준

- 초기 페이지 LCP < 2.5 s (데스크톱 환경, 75th percentile)
- WebSocket 재연결 지연 < 3 s
- Lighthouse Performance 90점 이상
- WCAG 2.1 AA 접근성 준수

## 10. 테스트 전략

- Jest + React Testing Library 컴포넌트 단위 테스트 (Coverage ≥ 80 %)
- Cypress E2E: 핵심 시나리오(낙상 발생→확인) 매 빌드 실행
- VRT(시각 회귀): Storybook + Chromatic

## 11. 릴리스 로드맵

| 마일스톤                    | 기간       | 산출물                                   |
| --------------------------- | ---------- | ---------------------------------------- |
| M1 UX 설계 · 시스템 셋업    | 주차 1–2   | Figma 와이어프레임, 기술 스택 초기화     |
| M2 대시보드 MVP             | 주차 3–5   | KPI 카드, Alert Timeline, WebSocket 통합 |
| M3 CCTV View & Event Detail | 주차 6–8   | 라이브 스트림, 클립 재생                 |
| M4 Admin 기능               | 주차 9–10  | 계정 승인, 병상 메타 관리                |
| M5 QA · 배포                | 주차 11–12 | 테스트 통과, Vercel/내부 서버 배포       |

## 12. 오픈 이슈

1. 야간 IR 센서 미지원 → 이미지 품질 저하 시 처리 방안
2. 침대 폴리곤 좌표 수기 등록 UX 개선 필요
3. 장기 보존용 이벤트 클립 스토리지 비용 추정

---

본 PRD는 2025‑05‑31 기준 초안이다. 추가 피드백에 따라 세부 항목을 보완한다.

asd
