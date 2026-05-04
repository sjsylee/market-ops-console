# Market Ops Console

**운영 자동화 콘솔의 기술 구조를 포트폴리오로 재구성한 모노레포입니다.**  
*A portfolio monorepo reconstructed from a live operations automation project.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Demo](https://img.shields.io/badge/Demo-Live%20↗-22c55e)](https://market-ops-console-web.vercel.app/)

> 🔗 **데모:** [market-ops-console-web.vercel.app](https://market-ops-console-web.vercel.app/)

---

## 💡 이 프로젝트에 대해 / About This Project

실제 서비스 중인 플랫폼 운영 자동화 프로젝트를 기반으로 만든 포트폴리오 버전입니다.  
민감한 외부 연동 로직과 운영 시크릿은 제외했고, 아키텍처 설계 방식과 엔지니어링 의사결정 과정을 중심으로 구성했습니다.

*This is a portfolio edition of a live platform operations automation project. Private runtime logic and credentials are intentionally removed. The focus is on architectural decisions, contract design, and operational engineering.*

단순한 UI 데모가 아니라, 운영 도구를 웹/API 구조로 어떻게 설계하고, 어떤 문제를 풀었는지를 보여주는 것이 목적입니다.

*The goal is not just a UI showcase — it demonstrates how I designed a web/API operations console, what problems I solved, and how I reasoned through trade-offs.*

---

## 🏗️ 무엇을 설계했는가 / What I Built

### 📦 계약 우선 모노레포 구조 / Contract-First Monorepo

`packages/shared`에 Zod schema를 먼저 정의하고, Next.js 웹과 NestJS API가 같은 패키지를 통해 응답 형태를 맞추도록 설계했습니다.  
스키마가 단일 진실 공급원(single source of truth) 역할을 해서 웹/API 간 타입 불일치를 구조적으로 차단합니다.

*Shared Zod schemas act as the single source of truth. Both the web and API layers consume the same package, making type drift between services structurally impossible.*

### 🚀 Vercel + VM 분리 배포 관점 / Split Deployment Architecture

웹(Vercel)과 API/DB(VM)를 분리해 운영하는 구조를 전제로 설계했습니다.  
Vercel BFF와 VM API 사이의 장기 연결 비용, 인증 round-trip, 페이지 진입 시 다중 API 호출 문제를 구체적으로 다뤘습니다.

*Designed with a Vercel web + VM API split in mind. Addressed the latency costs of cross-boundary round-trips, auth serialization, and multi-fetch page entries — not just as theory, but as specific optimizations.*

### 🖥️ 운영 콘솔 UI / Operational Console UI

작업 허브, 루프별 상세, current 스냅샷, 계정 관리, 실시간 로그, 알림을 포함한 운영 전용 UI입니다.  
SSE 기반 실시간 상태를 단일 연결에서 컴포넌트별로 구독 분배하는 이벤트 아키텍처를 적용했습니다.

*An operations-first UI covering job hub, loop detail, current snapshots, account management, real-time logs, and notifications. SSE events are distributed from a single connection to component-level subscribers via an internal event bus.*

### ⚡ 성능 최적화 / Performance Optimization

구조적으로 측정 가능한 개선을 적용했습니다:

| 개선 항목 | Before | After |
|---|---|---|
| 브라우저 SSE 연결 수 | 화면/컴포넌트별 중복 연결 가능 | 앱 셸 기준 1개 |
| 보호 페이지 인증 확인 | 서버 렌더마다 `/auth/me` API 직렬 호출 | middleware cookie gate로 추가 왕복 제거 |
| 콘솔 주요 페이지 진입 API 호출 | 루프/상태/큐 등 5~9회 개별 호출 | aggregate read model API 1회 |
| 매크로 상세 페이지 진입 API 호출 | 계정/상태/작업 목록 개별 조회 | `/overview/macro-detail` 1회 |
| 모달 열기/닫기 | URL navigation → 서버 페이지 전체 refetch | client-side URL modal state로 즉시 반응 |
| 실시간 로그 브라우저 보관 | 장시간 실행 시 DOM 무제한 증가 | 최근 120개 슬라이딩 윈도우 |
| SSE 계정 소유권 확인 DB 쿼리 | 이벤트 발행마다 DB 조회 | 연결 단위 30초 TTL 캐시 |

*Quantifiable structural improvements — not micro-optimizations, but re-designed API boundaries and event architecture.*

---

## 🛠️ 기술 스택 / Stack

| 영역 | 스택 | 선택 이유 |
|---|---|---|
| Web | Next.js App Router, React 18, Tailwind CSS | 서버 컴포넌트 기반 초기 렌더와 BFF 구조가 운영 콘솔에 적합 |
| Animation / Chart | Framer Motion, Recharts | 상태 전환 인터랙션과 운영 지표 시각화 |
| API | NestJS (module/controller/service) | 명시적인 레이어 경계와 DI 구조가 유지보수에 유리 |
| Contract | Zod, shared TypeScript types | 웹/API가 같은 schema를 참조해 타입 drift 방지 |
| Infra | Docker Compose, systemd 기반 VM 운영 | 로컬 데모와 실제 VM 운영 환경을 함께 고려 |
| Quality | TypeScript strict mode, workspace build scripts | `typecheck`와 `build`가 shared → API → web 순서로 검증 |

---

## 📁 레포 구조 / Repository Structure

```
apps/web/            # Next.js 운영 콘솔 웹 데모 (Vercel-ready)
apps/api/            # NestJS 데모 API (계약 경계 시연)
packages/shared/     # Zod schema 및 공용 TypeScript 타입
infra/docker/        # 로컬 데모용 Docker Compose
infra/env/           # 환경 변수 안내
docs/architecture/   # 아키텍처 및 런타임 모델 문서
docs/deployment/     # 배포 구조 및 인프라 메모
docs/portfolio/      # 성능 최적화, 보안, 트러블슈팅 기록
```

---

## 📚 문서 / Documentation

설계 의사결정과 운영 관점 기록을 함께 남겼습니다.

- 🏗️ [Architecture Overview](docs/architecture/overview.md) — 전체 구조와 경계 설계
- 🔄 [Runtime Model](docs/architecture/realtime-and-workers.md) — 실시간 이벤트와 워커 런타임 모델
- 🚢 [Deployment](docs/deployment/vercel-and-api.md) — Vercel + VM 분리 배포 구조
- 🧭 [Case Study](docs/portfolio/case-study.md) — 프로젝트 배경과 엔지니어링 스토리
- ⚡ [Performance Optimization](docs/portfolio/performance-optimization.md) — 구조적 성능 개선 기록
- 🛡️ [Security Hardening](docs/portfolio/security-hardening.md) — 보안 설계 및 강화 기록
- 🧯 [Troubleshooting Log](docs/portfolio/troubleshooting-log.md) — 실제 트러블슈팅 사례

---

## 🚀 실행 방법 / Getting Started

```bash
npm install
npm run dev:web   # Next.js 웹 데모 (API 없이도 mock handler로 동작)
npm run dev:api   # NestJS 데모 API
```

```bash
npm run typecheck  # shared → api → web 순서 타입 검증
npm run build      # 전체 빌드 검증
```

---

## 📝 포트폴리오 노트 / Portfolio Note

이 저장소는 현재 서비스 중인 프로젝트의 포트폴리오 버전입니다.  
실제 외부 API 클라이언트, 계정 세션 처리, 자동화 실행기 내부 로직, 운영 시크릿은 포함하지 않았습니다.  
공개 가능한 데모 데이터와 문서를 통해 제품 흐름과 엔지니어링 의사결정을 확인할 수 있습니다.

*This is the portfolio edition of an active service. Private runtime logic, credentials, and external API clients are excluded. Engineering decisions and product flow are visible through demo data and documentation.*
