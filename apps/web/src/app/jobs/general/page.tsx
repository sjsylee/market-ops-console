import { SectionHero } from '../../../components/dashboard/section-hero';
import { Reveal } from '../../../components/ui/reveal';
import { requireAuthenticatedPage } from '../../../lib/auth';
import { getMacroDetailOverview } from '../../../lib/macro-detail-overview';
import { GeneralLoopStateCard } from '../../../components/jobs/general-loop-state-card';
import { GeneralLoopTaskList } from '../../../components/jobs/general-loop-task-list';
import { MacroControlBar } from '../../../components/jobs/macro-control-bar';
import { MacroBackLink } from '../../../components/jobs/macro-back-link';
import { MacroSecondaryActions } from '../../../components/jobs/macro-secondary-actions';
import { MacroStatusCards } from '../../../components/jobs/macro-status-cards';
import { MacroPageModals } from '../../../components/jobs/macro-page-modals';
import { JobStreamRefresher } from '../../../components/jobs/job-stream-refresher';
import { LoopAccountSlot } from '../../../components/jobs/loop-account-slot';
import { createPageMetadata } from '../../../lib/page-metadata';

export const metadata = createPageMetadata(
  'General Storage Macro',
  '일반 운영 계정의 보관 판매 작업 큐와 실행 로그를 관리합니다.',
);

type ModalType = 'add' | 'pending' | 'success' | 'failed' | 'logs';
type PageProps = { searchParams?: { keyword?: string; productId?: string; modal?: ModalType } };

export default async function GeneralMacroPage({ searchParams }: PageProps) {
  await requireAuthenticatedPage('/jobs/general');
  const overview = await getMacroDetailOverview('general-loop');
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
          cycleCount: 0,
          pendingCount: 0,
          successCount: 0,
          failedCount: 0,
          lastError: null,
          options: {
            delayPerTask: 7000,
            delayAfterCycle: 15000,
            delayAfterExceed: 15000,
            delayAfterIpBlock: 600000,
            delayAfterSecondReq: 2000,
            maxSecondAttempts: 3,
          },
        },
      };
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING' || task.status === 'WAITING_REQ2');
  const successTasks = tasks.filter((task) => task.status === 'SUCCEEDED');
  const failedTasks = tasks.filter((task) => task.status === 'FAILED');
  const currentTask = tasks.find((task) => task.id === resolvedStateResponse.state.currentTaskId) ?? null;
  const modal = searchParams?.modal;
  const canStart = tasks.some((task) => task.status === 'PENDING' || task.status === 'FAILED');
  const basePath = '/jobs/general';

  return (
    <>
      <JobStreamRefresher kind="general-loop" accountId={selectedAccount?.id} />
      <Reveal>
        <div className="grid gap-4">
          <MacroBackLink />
          <SectionHero
            eyebrow="General Storage"
            title="일반 보관 매크로"
            description="기본 보관 판매 작업을 추가하고, 현재 큐를 확인하며, 서버에서 계속 실행되는 상태를 직접 제어합니다."
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
              <p className="mt-2 text-sm text-text-secondary">브라우저를 닫아도 서버에서 작업이 계속 진행됩니다. 다만 서버 재시작 시 중단될 수 있습니다.</p>
              <div className="mt-5 grid gap-4">
                <LoopAccountSlot
                  kind="general-loop"
                  accounts={loopAccounts}
                  selectedAccountId={selectedAccount?.id}
                  autoSelected={loopSelection.autoSelected}
                  running={resolvedStateResponse.state.running}
                />
                <MacroControlBar kind="general-loop" accountId={selectedAccount?.id} running={resolvedStateResponse.state.running} canStart={canStart} addHref={`${basePath}?modal=add`} options={resolvedStateResponse.state.options} />
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
            secondaryActions={<MacroSecondaryActions kind="general-loop" accountId={selectedAccount?.id} clearEnabled={pendingTasks.length + failedTasks.length > 0} running={resolvedStateResponse.state.running} logsHref={`${basePath}?modal=logs`} />}
          />
        </Reveal>
      </div>
      <MacroPageModals
        kind="general-loop"
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
