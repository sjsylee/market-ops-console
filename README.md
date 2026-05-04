# Market Ops Console

## 🚀 Project Overview / 프로젝트 개요

Market Ops Console은 현재 서비스 중인 마켓 운영 자동화 프로젝트에서 핵심 실행 로직과 실제 외부 연동을 제외하고, 기술 구조와 제품 경험을 포트폴리오 형태로 재구성한 모노레포입니다.

Market Ops Console is a portfolio monorepo derived from a live operations automation project. It removes the private automation runtime and real external integrations, while keeping the architecture, contracts, UI flow, and deployment thinking visible.

이 레포의 목적은 단순한 화면 데모가 아니라, 운영 도구를 웹/API 구조로 설계하고 배포 가능한 형태로 다듬은 과정을 보여주는 것입니다.

The focus is not just a UI showcase. It highlights the engineering shape behind an operations console: contract-first schemas, separated web/API boundaries, runtime state modeling, infrastructure notes, performance work, security hardening, and deployment troubleshooting.

## ✨ What This Shows / 보여주는 것

- 실제 서비스 구조를 바탕으로 한 `Next.js + NestJS` 모노레포
- A Next.js + NestJS monorepo based on a real service architecture
- `packages/shared`의 Zod schema를 기준으로 한 계약 우선 설계
- Contract-first development with shared Zod schemas
- 서버 실행기와 외부 연동을 제외한 데모 API와 목업 데이터 레이어
- Demo API and mock data layer with private worker/integration logic removed
- Vercel Web과 VM/container API를 분리해 생각한 배포 구조
- Deployment design that separates Vercel web from VM/container API services
- 성능 최적화, 보안 하드닝, 트러블슈팅 기록을 포함한 운영 관점 문서
- Operational documentation covering performance, security hardening, and troubleshooting

## 🧱 Stack / 기술 스택

| Area | Stack | Notes |
| --- | --- | --- |
| Web / 웹 | Next.js App Router, React 18, Tailwind CSS, Framer Motion, Recharts | 운영 상태, 입찰 테이블, 작업 큐, 알림, 테마 UI |
| API / API | NestJS, module/controller/service structure | 실제 연동 대신 계약 형태의 데모 데이터 제공 |
| Contract / 계약 | Zod, shared TypeScript types | 웹과 API가 같은 응답 계약 참조 |
| Infra / 인프라 | Docker Compose, env samples, Vercel-ready web | 로컬 API 데모와 분리 배포 관점 문서화 |
| Quality / 품질 | TypeScript strict mode, workspace build scripts | `typecheck`와 `build`가 shared, API, web을 순서대로 검증 |

## 🗂️ Repository Structure / 레포 구조

~~~txt
apps/web/            # Next.js portfolio web demo / 포트폴리오 웹 데모
apps/api/            # NestJS demo API / 데모 API
packages/shared/     # Zod contracts / 공용 계약
infra/docker/        # Local demo infrastructure / 로컬 데모 인프라
infra/env/           # Environment notes / 환경 변수 안내
docs/architecture/   # Architecture notes / 아키텍처 문서
docs/deployment/     # Deployment notes / 배포 문서
docs/portfolio/      # Performance, security, troubleshooting records / 포트폴리오 운영 기록
~~~

## 🧪 Demo Modes / 데모 방식

`apps/web`은 Vercel에 바로 올릴 수 있는 포트폴리오 웹 데모입니다. 운영 API URL 없이도 hosted demo를 열어볼 수 있도록 local mock handler를 포함합니다.

`apps/web` is a Vercel-ready portfolio web demo. It includes local mock handlers, so reviewers can open the hosted demo without a production API URL.

`apps/api`는 같은 shared contract를 NestJS controller/service 경계에서 제공하는 데모 API입니다. 실제 production runtime을 노출하기 위한 앱이 아니라, 백엔드 구조와 계약 경계를 보여주기 위한 앱입니다.

`apps/api` serves the same shared contracts through NestJS controller/service boundaries. It exists to show the backend structure and contract boundary, not to expose the private production runtime.

## 📚 Documentation / 문서

- [Architecture Overview](docs/architecture/overview.md) / 아키텍처 개요
- [Runtime Model](docs/architecture/realtime-and-workers.md) / 런타임 모델
- [Deployment](docs/deployment/vercel-and-api.md) / 배포 구조
- [Portfolio Case Study](docs/portfolio/case-study.md) / 포트폴리오 케이스 스터디
- [Performance Optimization](docs/portfolio/performance-optimization.md) / 성능 최적화 기록
- [Security Hardening](docs/portfolio/security-hardening.md) / 보안 하드닝 기록
- [Troubleshooting Log](docs/portfolio/troubleshooting-log.md) / 트러블슈팅 로그

## ⚙️ Getting Started / 실행 방법

~~~bash
npm install
npm run dev:web
npm run dev:api
~~~

## ✅ Verification / 검증

~~~bash
npm run typecheck
npm run build
~~~

## 📝 Portfolio Note / 포트폴리오 메모

이 저장소는 현재 서비스 중인 프로젝트의 기술적 구조를 설명하기 위한 포트폴리오 버전입니다. 실제 외부 API 클라이언트, 계정 세션 처리, 자동화 실행기 내부 로직, 운영 시크릿은 포함하지 않았고, 공개 가능한 데모 데이터와 문서로 제품 흐름과 엔지니어링 의사결정을 보여줍니다.

This repository is the portfolio edition of an active service project. It keeps the engineering structure and product flow, while replacing private runtime logic with reviewable demo data and documentation.
