# 🏗️ Architecture Overview / 아키텍처 개요

Market Ops Console은 현재 서비스 중인 운영 자동화 프로젝트의 기술 구조를 포트폴리오로 보여주기 위해 재구성한 모노레포입니다.

Market Ops Console keeps the production-style architecture visible while removing the private worker runtime and real external integration logic.

핵심 설계는 contract-first 방식입니다.

Shared Zod schema에서 응답 형태를 먼저 정의하고, Next.js UI와 NestJS API가 같은 package를 통해 정렬되도록 구성했습니다.

The key design point is contract-first development. Shared Zod schemas define the response shape before either the web or API layer consumes it, so both sides stay aligned through the same package.

## 🧭 Boundary / 경계

- `apps/web`: Next.js App Router UI and Vercel-ready demo handlers
- `apps/api`: NestJS demo API with controller/service boundaries and shared schema validation
- `packages/shared`: Zod contracts and shared TypeScript types
- `infra`: Docker and environment samples for local demo operations
- `docs`: Architecture, deployment, and portfolio operation notes
