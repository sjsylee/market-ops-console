import { SectionHero } from '../../../components/dashboard/section-hero';
import { Reveal } from '../../../components/ui/reveal';
import { requireAuthenticatedPage } from '../../../lib/auth';
import { getMacroDetailOverview } from '../../../lib/macro-detail-overview';
import { GeneralLoopStateCard } from '../../../components/jobs/general-loop-state-card';
import { MacroControlBar } from '../../../components/jobs/macro-control-bar';
import { MacroBackLink } from '../../../components/jobs/macro-back-link';
import { MacroSecondaryActions } from '../../../components/jobs/macro-secondary-actions';
import { JobStreamRefresher } from '../../../components/jobs/job-stream-refresher';
import { LoopAccountSlot } from '../../../components/jobs/loop-account-slot';
import { createPageMetadata } from '../../../lib/page-metadata';
import { MacroPageModals } from '../../../components/jobs/macro-page-modals';

export const metadata = createPageMetadata(
  'Vendor Storage Macro',
  '입점 계정의 보관 판매 작업과 세션 상태를 함께 관리합니다.',
);

type ModalType = 'add' | 'pending' | 'success' | 'failed' | 'logs';
type PageProps = { searchParams?: { keyword?: string; productId?: string; modal?: ModalType } };

export default async function VendorMacroPage({ searchParams }: PageProps) {
  await requireAuthenticatedPage('/jobs/vendor');
  const overview = await getMacroDetailOverview('bp-loop');
  const accounts = overview.accounts;
  const loopSelection = overview.selection;
  const loopAccounts = accounts;
  const selectedAccount = loopSelection.account;
  const stateResponse = overview.state;
  const tasks = overview.tasks;
  const resolvedStateResponse = selectedAccount
    ? stateResponse
    : {
        ok: true as const,
        executionId: null,
        state: {
          running: false,
          accountId: null,
          currentTaskId: null,
          pendingCount: 0,
          successCount: 0,
          failedCount: 0,
          lastError: null,
          options: {
            delayPerTask: 7000,
            delayAfterCycle: 15000,
            delayAfterExceed: 15000,
            delayAfterIpBlock: 600000,
            delayAfterSecondReq: 3000,
            maxSecondAttempts: 2,
          },
        },
      };
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING' || task.status === 'WAITING_REQ2');
  const successTasks = tasks.filter((task) => task.status === 'SUCCEEDED');
  const failedTasks = tasks.filter((task) => task.status === 'FAILED');
  const currentTask = tasks.find((task) => task.id === resolvedStateResponse.state.currentTaskId) ?? null;
  const modal = searchParams?.modal;
  const canStart = tasks.some((task) => task.status === 'PENDING' || task.status === 'FAILED');
  const basePath = '/jobs/vendor';

  return (
    <>
      <JobStreamRefresher kind="bp-loop" accountId={selectedAccount?.id} />
      <Reveal>
        <div className="grid gap-4">
          <MacroBackLink />
          <SectionHero
            eyebrow="Vendor Storage"
            title="입점 보관 매크로"
            description="입점 계정 기준 보관 판매 작업을 추가하고, 인증 상태를 확인하며, 큐와 실행 흐름을 함께 관리합니다."
          />
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6">
        <Reveal delay={0.05}>
          <section className={`card-panel macro-running-surface p-6 ${resolvedStateResponse.state.running ? 'macro-running-surface-active' : ''}`}>
            {resolvedStateResponse.state.running ? (
              <>
                <div aria-hidden className="macro-running-aurora" />
                <div aria-hidden className="macro-running-sheen" />
                <div aria-hidden className="macro-running-scanlines" />
              </>
            ) : null}
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Macro Controls</p>
              <h2 className="mt-2 text-2xl font-bold">실행 제어</h2>
              <p className="mt-2 text-sm text-text-secondary">입점 계정이 선택돼 있어야 작업 추가와 실행이 가능합니다.</p>
              <div className="mt-5 grid gap-4">
                <LoopAccountSlot
                  kind="bp-loop"
                  accounts={loopAccounts}
                  selectedAccountId={selectedAccount?.id}
                  autoSelected={loopSelection.autoSelected}
                  running={resolvedStateResponse.state.running}
                />
                <MacroControlBar kind="bp-loop" accountId={selectedAccount?.id} running={resolvedStateResponse.state.running} canStart={canStart} addHref={`${basePath}?modal=add`} options={resolvedStateResponse.state.options} />
              </div>
            </div>
          </section>
        </Reveal>
        <Reveal delay={0.1}>
          <GeneralLoopStateCard
            state={resolvedStateResponse.state}
            currentTaskSummary={
              currentTask
                ? {
                    productId: currentTask.productId,
                    productName: currentTask.productName,
                    optionCount: currentTask.options.length,
                  }
                : null
            }
            statusCards={[
              { label: '대기 중', count: pendingTasks.length, href: `${basePath}?modal=pending`, tone: 'pending' },
              { label: '성공', count: successTasks.length, href: `${basePath}?modal=success`, tone: 'success' },
              { label: '실패', count: failedTasks.length, href: `${basePath}?modal=failed`, tone: 'failed' },
            ]}
            secondaryActions={<MacroSecondaryActions kind="bp-loop" accountId={selectedAccount?.id} clearEnabled={pendingTasks.length + failedTasks.length > 0} running={resolvedStateResponse.state.running} logsHref={`${basePath}?modal=logs`} />}
          />
        </Reveal>
      </div>
      <MacroPageModals
        kind="bp-loop"
        basePath={basePath}
        accountId={selectedAccount?.id}
        initialModal={modal}
        running={resolvedStateResponse.state.running}
        pendingTasks={pendingTasks}
        successTasks={successTasks}
        failedTasks={failedTasks}
      />
    </>
  );
}
