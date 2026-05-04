# 🧭 Portfolio Case Study / 포트폴리오 케이스 스터디

이 프로젝트는 데스크톱 중심으로 운영되던 작업 흐름을 웹/API 구조로 옮기며 만든 현재 서비스 프로젝트의 포트폴리오 버전입니다.

This project is the portfolio edition of a live service that migrated desktop-oriented operations workflows into a web/API architecture.

핵심 실행 로직과 실제 외부 연동은 제외했지만, 모노레포 구조와 shared contract, Next.js 운영 UI, NestJS API 경계, Docker 기반 로컬 인프라, Vercel 배포 관점은 남겨두었습니다.

The private automation runtime is intentionally absent, but the monorepo structure, shared contracts, Next.js operations UI, NestJS API boundary, Docker-based local infrastructure, and Vercel deployment perspective remain visible.

## ✨ Highlights / 강조 포인트

- Contract-first shared schemas / 계약 우선 shared schema
- Next.js operational UI / Next.js 운영 도구 UI
- NestJS module-controller-service API boundary / NestJS 모듈-컨트롤러-서비스 경계
- Demo data replacing private runtime logic / 핵심 실행 로직을 대체한 데모 데이터
- Docker-based local API demo / Docker 기반 로컬 API 데모
- Vercel-ready web deployment / Vercel 웹 배포 준비
- Performance, security, and troubleshooting records / 성능, 보안, 트러블슈팅 기록

## 🧠 Engineering Story / 엔지니어링 스토리

처음부터 화면만 만든 프로젝트가 아니라, 계정 경계, 작업 상태, 장시간 실행 로그, realtime event, read model API, 배포 환경 차이를 함께 다룬 프로젝트입니다.

This was not only a UI project. It involved account boundaries, work states, long-running logs, realtime events, read model APIs, and deployment-environment differences.
