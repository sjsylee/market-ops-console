# 🛡️ Security Hardening / 보안 하드닝 기록

이 문서는 현재 서비스 프로젝트에서 진행한 보안 개선을 포트폴리오 관점으로 정리한 기록입니다.

This document describes security hardening work from the live service project while omitting private integration details.

## 🧱 Boundary Design / 보안 경계

Next.js Web은 브라우저와 API 사이에서 쿠키와 프록시 요청을 다루는 BFF 성격의 경계로 두고, NestJS API는 인증, 세션 검증, 계정 소유권 확인, 외부 연동 호출을 담당하는 서버 경계로 분리했습니다.

The API never exposes ORM models directly; request and response shapes are validated through shared Zod contracts.

이 포트폴리오 레포에서는 실제 계정 세션과 외부 API 클라이언트를 제거했지만, 같은 경계와 계약 구조는 남겨두었습니다.

The repository demonstrates the architecture without shipping the private runtime.

## 🔐 Web and API Headers / 웹과 API 보안 헤더

웹 전역에 `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`를 적용했습니다.

The same baseline was mirrored on the API side so direct API access and web access share conservative browser-facing defaults.

이미지 로딩은 전체 HTTPS 허용 대신 필요한 remote host allowlist로 좁히는 방향을 잡았습니다.

For the portfolio demo, local assets are used by default.

## 🌐 Origin and Proxy Policy / Origin과 프록시 정책

로그인과 토큰 재발급처럼 공개적으로 접근 가능한 인증 경로도 Origin 검증 대상에 포함했습니다.

The BFF proxy standardizes API URL construction, forwarded headers, cookie handling, JSON forwarding, no-store responses, and request body limits.

이런 정책은 “동작하는 프록시”보다 “운영 중 실수하기 어려운 프록시”를 목표로 둔 개선입니다.

The goal was to make the secure path the default path.

## ✅ Input Contract Hardening / 입력 계약 강화

`packages/shared`의 공통 schema에 `accountId`, `productId`, 가격, 검색어, 옵션명, 이미지 URL, 카테고리 배열 같은 입력 제한을 정리했습니다.

Loop creation, price update, catalog search, and push subscription inputs reuse the same validation vocabulary.

긴 문자열, 과대 배열, 비정상 가격, 잘못된 URL이 서비스 내부 로직까지 들어오기 전에 차단되도록 했습니다.

This keeps validation close to the public contract instead of scattering ad hoc checks across controllers.

## 🧽 Redaction and Error Shape / 마스킹과 에러 응답

비밀번호, token, Authorization, Cookie, session, secret, push key 계열 필드는 공통 redaction 계층에서 재귀적으로 마스킹했습니다.

Remote error bodies, audit logs, job event payloads, and stored last errors pass through redaction before persistence.

NestJS 전역 예외 필터는 API 오류 응답을 `{ ok, statusCode, code, message, path, timestamp }` 형태로 표준화합니다.

Validation errors return bounded issue details, while internal errors avoid leaking server-side messages.

## 🗄️ Retention and Push Lifecycle / 보존 정책과 Push 생명주기

작업 로그와 알림은 운영 추적에 필요하지만, 오래 보존될수록 DB 비용과 민감정보 장기 보관 리스크가 커집니다.

Retention settings define cleanup windows for job events, read notifications, max notification age, inactive push subscriptions, and stale push subscriptions.

Web Push endpoint가 영구 실패 상태를 반환하면 구독을 비활성화해 불필요한 외부 전송 반복을 줄였습니다.

Push failure logs are also redacted before storage.

## 📝 Portfolio Summary / 요약

이 프로젝트의 보안 하드닝은 인증 경계, Origin 검증, HttpOnly cookie 기반 세션, 계정 소유권 검증, 입력 계약 강화, 보안 헤더, 요청 크기 제한, 민감정보 마스킹, 표준 에러 응답, 로그/알림 보존 정책을 하나의 운영 기준으로 묶은 작업입니다.

The portfolio version keeps the shape of that work while replacing the sensitive implementation details with demo structure.
