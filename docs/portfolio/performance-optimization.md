# ⚡ Performance Optimization / 성능 최적화 기록

이 문서는 현재 서비스 중인 운영 콘솔 프로젝트에서 진행한 성능 개선 내용을 포트폴리오 관점으로 정리한 것입니다.

This note summarizes performance work from the live operations project, rewritten for the portfolio repository without exposing private runtime details.

## 🎯 Operating Boundary / 운영 경계

서비스는 대규모 공개 SaaS보다 소규모 운영자가 장시간 켜두는 작업 콘솔에 가깝습니다.

The target was not unlimited throughput; the goal was stable long-running work on a modest VM while the web UI stays responsive.

Web은 Vercel에 두고 API/DB는 VM 또는 container 환경에서 운영하는 구조를 기준으로 병목을 나눠 봤습니다.

The main optimization axes were fewer long-lived connections, fewer repeated DB queries, controlled state persistence, and predictable memory guardrails.

## 🔌 Single SSE Connection / SSE 연결 단일화

초기 구조에서는 앱 셸, 작업 화면, 상태 카드, 로그 영역이 각각 `EventSource`를 열 수 있었습니다.

I introduced an app-level event provider so the browser keeps one SSE connection and distributes events through an internal subscription API.

`general-loop`, `bp-loop`, `im-loop`, `lowest-loop`, `current.sync`처럼 작업 도메인별 이벤트는 타입별로 구독합니다.

This keeps screen-level refresh behavior intact while reducing long-lived connection pressure between Vercel and the API service.

## 🧭 Event Visibility Cache / 이벤트 가시성 캐시

SSE 이벤트를 보낼 때마다 계정 소유권 확인 쿼리가 반복되면 장시간 실행 중 작은 쿼리가 계속 누적됩니다.

The production design caches the user visible account set for a short TTL per SSE connection, then validates event `accountId` against that cached boundary.

보안 경계는 유지하면서 per-event DB query를 줄이는 방향입니다.

The important part is that optimization did not bypass ownership checks; it moved them to a connection-scoped cache.

## 📦 Read Model APIs / 화면 단위 Read Model

Vercel 서버 컴포넌트가 VM API를 여러 번 직렬 호출하면 모바일 탭 전환이 곧 왕복 지연으로 이어집니다.

I added page-level read model endpoints such as console overview, account overview, macro detail overview, and lowest-loop detail overview.

Command API는 그대로 두고, 화면 진입에 필요한 조립 조회만 aggregate API로 묶었습니다.

This separates command boundaries from page-entry optimization, and the response contracts live in `packages/shared` first.

## 🪟 Modal and Navigation Cost / 모달과 이동 비용

작업 화면의 `?modal=add`, `?modal=logs`, `?modal=pending` 전환이 서버 네비게이션으로 처리되면 모달 열기마다 페이지 전체 데이터가 다시 조회됩니다.

I moved modal state to client-side URL state with `history.pushState`, while keeping the URL shareable.

로그 모달은 열릴 때 로그 API만 별도로 조회하도록 분리했습니다.

This made modal open and close feel instant and avoided page-wide refetches.

## 🎨 Rendering and Client Bundle / 렌더링 비용

단순 reveal 애니메이션은 CSS keyframe으로 전환하고, Framer Motion은 모달/빌더처럼 실제 상태 전환이 필요한 곳에만 남겼습니다.

Heavy visual effects such as constant blur animations were reduced to lower paint cost on mobile and slower devices.

실시간 로그는 브라우저 상태에 최근 120개만 유지해 장시간 켜둔 탭에서 DOM과 배열이 계속 커지지 않게 했습니다.

The UI still feels live, but it avoids unbounded client-side growth.

## 🚀 Vercel LCP and Auth Round Trip / Vercel LCP와 인증 왕복

보호 페이지가 렌더링 전에 항상 `/auth/me`를 호출하던 직렬 왕복을 제거했습니다.

Middleware handles cookie refresh, while server pages can start rendering based on cookie presence and page data fetching.

또한 `loading.tsx` skeleton을 추가해 VM API 응답이 늦어져도 고정 레이아웃을 먼저 보여줬습니다.

The skeleton uses stable dimensions to avoid layout shift during navigation.

## 📝 Portfolio Summary / 요약

Vercel Web과 VM API/DB 분리 운영을 전제로, SSE 연결 단일화, 이벤트 가시성 캐시, 화면 단위 read model API, client-side modal state, 탭 prefetch, loading skeleton, CSS 기반 animation 전환, 실시간 로그 길이 제한을 적용해 초기 로딩과 장시간 실행 화면의 체감 성능을 개선했습니다.

In short, the work focused on making an operations console feel steady during long-running automation, not just making a page render faster once.
