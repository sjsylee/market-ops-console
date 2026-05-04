# 🚢 Deployment / 배포

[← README](../../README.md) · 🔗 [Live Demo](https://market-ops-console-web.vercel.app/)

---

포트폴리오 데모는 Vercel 웹 배포에 맞춰져 있습니다. `apps/web`에는 local mock handler가 포함되어 있어 hosted demo는 production API URL 없이도 동작합니다.

The portfolio demo is optimized for Vercel web deployment. `apps/web` contains local mock handlers, so the hosted demo can run without a production API URL.

동시에 레포에는 `apps/api`와 Docker 구성을 남겨두었습니다. 원본 서비스의 구조는 web과 API를 별도 배포 단위로 보고, web은 Vercel에, API는 VM/container runtime에 두는 방향이었습니다.

The repository still includes `apps/api` and Docker configuration. This reflects the original service architecture: the web and API are separate deployable units, with the web suited for Vercel and the API suited for a VM/container runtime.

## 🧱 Deployment Shape / 배포 형태

- Web: Vercel-hosted Next.js app / Web은 Vercel 기반 Next.js 앱으로 배포합니다.
- API: NestJS service deployable as a container / API는 container로 배포 가능한 NestJS 서비스입니다.
- Shared: built before web/API builds / shared package는 web/API 빌드 전에 먼저 빌드합니다.
- Infra: Docker Compose for local API demonstration / infra는 로컬 API 데모와 운영 구조 설명을 담당합니다.

## ⚙️ Commands / 명령어

~~~bash
npm run dev:web
npm run dev:api
npm run typecheck
npm run build
~~~
