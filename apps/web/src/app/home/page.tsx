import Link from "next/link";
import {
  Activity,
  Archive,
  BadgeDollarSign,
  Gauge,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CurrentSyncState } from "@market-ops/shared";

import { SectionHero } from "../../components/dashboard/section-hero";
import { Reveal } from "../../components/ui/reveal";
import { requireAuthenticatedPage } from "../../lib/auth";
import { createPageMetadata } from "../../lib/page-metadata";
import { getMacroSummary } from "../../lib/jobs";
import { getConsoleOverview } from "../../lib/overview";

export const metadata = createPageMetadata(
  "Dashboard",
  "매크로 실행 상태와 입찰 데이터를 한 화면에서 확인하는 Market Ops Console 대시보드입니다.",
);

function formatDateTime(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "기록 없음";
}

function isCurrentAreaRunning(
  state: CurrentSyncState,
  area: "inventory" | "ask",
) {
  if (!state.running) return false;

  if (state.scope) {
    if (state.scope === "ALL") return true;
    return area === "inventory"
      ? state.scope === "INVENTORY"
      : state.scope === "ASK";
  }

  return area === "inventory"
    ? state.stage === "sync_inventory"
    : state.stage === "sync_ask";
}

export default async function HomePage() {
  await requireAuthenticatedPage("/home");

  const overview = await getConsoleOverview();
  const generalSelection = overview.selections.generalLoop;
  const vendorSelection = overview.selections.bpLoop;
  const purchaseBidSelection = overview.selections.imLoop;
  const currentSelection = overview.selections.currentSync;
  const general = overview.states.generalLoop;
  const vendor = overview.states.bpLoop;
  const purchaseBid = overview.states.imLoop;
  const currentSyncState = overview.states.currentSync.state;
  const lowestLoop = overview.states.lowestLoop;
  const lowestQueue = overview.lowestLoopQueue;
  const currentStats = overview.currentStats;

  const generalSummary = getMacroSummary(general.state);
  const vendorSummary = getMacroSummary(vendor.state);
  const purchaseBidSummary = getMacroSummary(purchaseBid.state);
  const currentStat = currentStats[0];
  const lowestActiveCount =
    lowestLoop.state.activeCount ||
    lowestQueue.filter((item) => item.active).length;
  const runningJobs = [
    generalSummary.running,
    vendorSummary.running,
    purchaseBidSummary.running,
    lowestLoop.state.running,
  ].filter(Boolean).length;
  const waitingJobs =
    generalSummary.pendingCount +
    vendorSummary.pendingCount +
    purchaseBidSummary.pendingCount +
    lowestActiveCount;
  const failedJobs =
    generalSummary.failedCount +
    vendorSummary.failedCount +
    purchaseBidSummary.failedCount;

  const macroCards = [
    {
      href: "/jobs/general",
      eyebrow: "Storage Macro",
      title: "일반 보관",
      account: generalSelection.account?.displayName ?? "계정 미선택",
      running: generalSummary.running,
      pending: generalSummary.pendingCount,
      success: generalSummary.successCount,
      failed: generalSummary.failedCount,
    },
    {
      href: "/jobs/vendor",
      eyebrow: "Vendor Storage",
      title: "입점 보관",
      account: vendorSelection.account?.displayName ?? "계정 미선택",
      running: vendorSummary.running,
      pending: vendorSummary.pendingCount,
      success: vendorSummary.successCount,
      failed: vendorSummary.failedCount,
    },
    {
      href: "/jobs/purchase-bid",
      eyebrow: "Purchase Bid",
      title: "구매 입찰",
      account: purchaseBidSelection.account?.displayName ?? "계정 미선택",
      running: purchaseBidSummary.running,
      pending: purchaseBidSummary.pendingCount,
      success: purchaseBidSummary.successCount,
      failed: purchaseBidSummary.failedCount,
    },
    {
      href: "/jobs/lowest-bid",
      eyebrow: "Lowest Bid Loop",
      title: "최저가 루프",
      account: currentSelection.account?.displayName ?? "입찰 계정 미선택",
      running: lowestLoop.state.running,
      pending: lowestActiveCount,
      success: lowestLoop.state.cycleCount,
      failed: lowestQueue.filter((item) => !item.active).length,
      successLabel: "사이클",
      failedLabel: "중지",
    },
  ];

  const currentCards = [
    {
      href: "/current/inventory",
      eyebrow: "Inventory Bids",
      title: "보관 입찰",
      icon: <Archive size={18} />,
      count: currentStat?.storedCount ?? 0,
      running: isCurrentAreaRunning(currentSyncState, "inventory"),
      lastSyncedAt: formatDateTime(currentStat?.lastSyncStoredAt),
    },
    {
      href: "/current/ask",
      eyebrow: "Normal Bids",
      title: "일반 입찰",
      icon: <BadgeDollarSign size={18} />,
      count: currentStat?.normalCount ?? 0,
      running: isCurrentAreaRunning(currentSyncState, "ask"),
      lastSyncedAt: formatDateTime(currentStat?.lastSyncNormalAt),
    },
  ];

  return (
    <>
      <Reveal>
        <SectionHero
          eyebrow="Operations Dashboard"
          title="Dashboard"
          description="매크로 실행 상태와 입찰 데이터를 한 화면에서 확인하고, 필요한 작업으로 바로 이동합니다."
        />
      </Reveal>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Reveal delay={0.05}>
          <DashboardMetricCard
            icon={<Activity size={18} />}
            label="실행 중"
            value={`${runningJobs}개`}
            description="현재 작동 중인 매크로와 루프"
            tone="info"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <DashboardMetricCard
            icon={<Gauge size={18} />}
            label="대기/활성"
            value={`${waitingJobs.toLocaleString("ko-KR")}건`}
            description="처리 대기 중인 작업과 활성 큐"
            tone="primary"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <DashboardMetricCard
            icon={<Sparkles size={18} />}
            label="확인 필요"
            value={`${failedJobs.toLocaleString("ko-KR")}건`}
            description="실패 작업 기준 빠른 점검 대상"
            tone={failedJobs > 0 ? "warning" : "success"}
          />
        </Reveal>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Reveal delay={0.2}>
          <div className="card-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
                  Macro Runtime
                </p>
                <h2 className="mt-2 text-2xl font-bold text-text-primary">
                  매크로 상황
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  계정별 실행 상태와 큐 흐름을 빠르게 확인합니다.
                </p>
              </div>
              <Link href="/jobs" className="btn-primary shrink-0">
                전체 보기
              </Link>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {macroCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`macro-hub-card relative overflow-hidden rounded-3xl border border-subtle bg-bg-card/65 p-4 transition hover:border-glow ${card.running ? "macro-hub-card-running" : ""}`}
                >
                  {card.running ? (
                    <>
                      <div aria-hidden className="macro-running-aurora" />
                      <div aria-hidden className="macro-running-sheen" />
                    </>
                  ) : null}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
                          {card.eyebrow}
                        </p>
                        <h3 className="mt-1 truncate text-lg font-bold text-text-primary">
                          {card.title}
                        </h3>
                      </div>
                      <span
                        className={`macro-status-pill ${card.running ? "macro-status-pill-running" : ""}`}
                      >
                        <span
                          aria-hidden
                          className={`macro-status-dot ${card.running ? "macro-status-dot-running" : ""}`}
                        />
                        {card.running ? "실행 중" : "대기 중"}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-xs text-text-muted">
                      계정 · {card.account}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <MiniCount label="대기" value={card.pending} />
                      <MiniCount
                        label={card.successLabel ?? "성공"}
                        value={card.success}
                        tone="success"
                      />
                      <MiniCount
                        label={card.failedLabel ?? "실패"}
                        value={card.failed}
                        tone={card.failedLabel ? "warning" : "failed"}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="card-panel h-full p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
                  Bid Board
                </p>
                <h2 className="mt-2 text-2xl font-bold text-text-primary">
                  입찰 현황
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  선택된 입찰 계정 기준 저장 데이터를 보여줍니다.
                </p>
              </div>
              <Link href="/current" className="btn-primary shrink-0">
                입찰 관리
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {currentCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-3xl border border-subtle bg-bg-card/65 p-4 transition hover:border-glow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
                        {card.eyebrow}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-text-primary">
                        {card.title}
                      </h3>
                    </div>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-bg-card text-accent-primary">
                      {card.icon}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-text-muted">저장 항목</p>
                      <p className="mt-1 text-2xl font-black text-accent-primary">
                        {card.count.toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`macro-status-pill ${card.running ? "macro-status-pill-running" : ""}`}
                      >
                        <span
                          aria-hidden
                          className={`macro-status-dot ${card.running ? "macro-status-dot-running" : ""}`}
                        />
                        {card.running ? "동기화 중" : "대기 중"}
                      </span>
                      <p className="mt-2 text-xs text-text-muted">
                        최근 · {card.lastSyncedAt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function DashboardMetricCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  tone: "primary" | "info" | "success" | "warning";
}) {
  const valueClass = {
    primary: "text-accent-primary",
    info: "status-value-info",
    success: "status-value-success",
    warning: "status-value-warning",
  }[tone];

  return (
    <article className="card-panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
          {label}
        </p>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-subtle bg-bg-card/65 text-accent-primary">
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-3xl font-black leading-none ${valueClass}`}>
        {value}
      </p>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </article>
  );
}

function MiniCount({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "failed" | "warning";
}) {
  const valueClass = {
    primary: "text-text-primary",
    success: "status-value-success",
    failed: "status-value-failed",
    warning: "status-value-warning",
  }[tone];

  return (
    <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold ${valueClass}`}>
        {value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}
