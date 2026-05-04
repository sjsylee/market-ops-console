# 🔄 Runtime Model / 런타임 모델

[← README](../../README.md) · 🔗 [Live Demo](https://market-ops-console-web.vercel.app/)

---

비공개 구현은 요청-응답 command와 장시간 실행 작업을 분리합니다. 운영 환경에서는 API command가 작업을 시작하거나 중지하고, 실행기는 request-response 타이밍 밖에서 장시간 루프를 처리합니다.

The production model separates immediate API commands from long-running worker execution. API commands start or stop work, while workers run outside request-response timing and report progress asynchronously.

이 포트폴리오 레포에는 민감한 worker 내부 로직을 포함하지 않았습니다. 대신 같은 화면 상태와 이벤트 흐름을 데모 데이터로 보여줘, live 계정이나 DB 없이도 운영 콘솔의 구조를 확인할 수 있게 했습니다.

The portfolio repository does not ship the private worker internals. Instead, it keeps the operational states visible through demo data so the runtime model can be reviewed without live accounts or a production database.

## 🧩 Runtime Responsibilities / 런타임 책임

- API commands start, stop, create, update, and clear work items / API command는 작업 생성, 수정, 시작, 중지를 담당합니다.
- Workers execute long-running loops outside request-response timing / 실행기는 요청-응답 타이밍 밖에서 장시간 루프를 처리합니다.
- SSE events publish state summaries and logs / SSE 이벤트는 상태 요약과 로그를 전달합니다.
- Read model APIs assemble page-entry data / read model API는 화면 진입에 필요한 데이터를 조립합니다.
