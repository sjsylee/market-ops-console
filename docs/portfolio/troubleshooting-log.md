# 🧯 Troubleshooting Log / 트러블슈팅 로그

[← README](../../README.md) · 🔗 [Live Demo](https://market-ops-console-web.vercel.app/)

---

이 문서는 실제 이식과 배포 중 만난 문제를 포트폴리오 레포에 맞게 일반화한 기록입니다.

It keeps the engineering lessons from production troubleshooting while removing private service names, URLs, and deployment targets.

## 🚨 Production Web Falling Back to Local API / 운영 Web이 Local API로 fallback

Vercel production web의 서버 컴포넌트와 route handler가 운영 API가 아니라 `127.0.0.1:4000`으로 요청을 보내며 `500`을 반환했습니다.

The failure looked like an API outage, but the real issue was web runtime configuration.

로컬 개발 편의를 위해 API base URL이 없으면 `localhost`로 fallback하는 설정이 있었습니다.

In Vercel production, however, `localhost` means the serverless runtime itself, not the API VM.

production에서는 API base URL 누락 또는 localhost 계열 값을 허용하지 않도록 guard를 추가했습니다.

A production fallback that points to localhost is worse than a loud build/runtime failure.

## 🧭 Vercel CLI Root Directory Double Application / Vercel CLI 루트 경로 중복 적용

Vercel 프로젝트의 Root Directory가 이미 `apps/web`인데, GitHub Actions에서도 Vercel CLI step의 working directory를 `apps/web`로 잡아 root가 두 번 적용되었습니다.

The build tried to resolve `apps/web/apps/web/package.json`.

`vercel pull`, `vercel build`, `vercel deploy`는 repository root에서 실행하도록 정리했습니다.

Vercel Dashboard 설정과 CI working directory는 하나의 책임만 가져야 합니다.

## 🔎 New API Endpoint Returns 404 After Web Deploy / 새 API endpoint 배포 후 404

Web이 새 aggregate endpoint를 호출하기 시작했지만 API에서 `GET /overview/console`이 `404`를 반환했습니다. 코드는 main에 포함되어 있었고 API CD도 성공했지만, VM/container 환경에서 기존 API 컨테이너가 새 이미지로 재생성되지 않은 상태였습니다.

API 이미지를 다시 pull한 뒤 컨테이너를 강제 재생성했습니다. 신규 인증 endpoint 배포 후에는 `404`와 `401/403`을 구분해야 합니다.

`404`는 라우트 미반영, `401/403`은 라우트는 존재하지만 인증 계층에서 막힌 상태입니다.

## 📦 Shared Package Missing in Clean Web Build / clean Web build에서 shared package 해석 실패

Vercel 또는 GitHub Actions Web build에서 workspace package를 찾지 못했습니다. shared package의 runtime export는 `dist/index.js`를 가리키는데, clean checkout에서는 web build 직전에 shared `dist`가 없습니다.

`apps/web/package.json`에 `prebuild`를 두어 web build 전에 shared package를 먼저 빌드하도록 했습니다.

Workspace package가 `dist` export를 사용한다면 clean checkout 기준으로 build order를 명시해야 합니다.

## 🧬 Typecheck Fails Without Generated ORM Client / generated client 없는 CI typecheck 실패

API typecheck가 clean runner에서만 실패하고 로컬에서는 통과했습니다. 로컬에는 이전 generate 결과가 남아 있었지만, CI는 dependency install 직후 typecheck를 실행하므로 schema 기준 client generation이 선행되지 않았습니다.

CI/CD workflow에서 API typecheck 전에 client generation step을 명시했습니다.

Generated artifact에 의존하는 workspace는 clean checkout 기준의 선행 작업을 workflow에 포함해야 합니다.
