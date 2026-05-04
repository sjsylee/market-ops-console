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
  'Purchase Bid Macro',
  '구매 입찰 작업 큐와 목표가 기준 실행 상태를 관리합니다.',
);

type ModalType = 'add' | 'pending' | 'success' | 'failed' | 'logs';
type PageProps = { searchParams?: { keyword?: string; productId?: string; modal?: ModalType } };

export default async function PurchaseBidMacroPage({ searchParams }: PageProps) {
  await requireAuthenticatedPage('/jobs/purchase-bid');
  const overview = await getMacroDetailOverview('im-loop');
  const accounts = overview.accounts;
  const loopSelection = overview.selection;
  const loopAccounts = accounts;
  const selectedAccount = loopSelection.account;
  const fallbackStateResponse = {
    ok: true,
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
        delayPerTask: 3000,
        delayAfterCycle: 30000,
        priceTolerance: 3000,
        delayJitterMs: 200,
        burningEnabled: true,
        burningRepeatCount: 1,
        burningDelayMinMs: 200,
        burningDelayMaxMs: 500,
      },
    },
  };
  const stateResponse = selectedAccount ? overview.state : fallbackStateResponse;
  const tasks = overview.tasks;
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING');
  const successTasks = tasks.filter((task) => task.status === 'SUCCEEDED');
  const failedTasks = tasks.filter((task) => task.status === 'FAILED');
  const currentTask = tasks.find((task) => task.id === stateResponse.state.currentTaskId) ?? null;
  const modal = searchParams?.modal;
  const canStart = tasks.some((task) => task.status === 'PENDING');
  const basePath = '/jobs/purchase-bid';

  return (
    <>
      <JobStreamRefresher kind="im-loop" accountId={selectedAccount?.id} />
      <Reveal>
        <div className="grid gap-4">
          <MacroBackLink />
          <SectionHero
            eyebrow="Purchase Bid"
            title="구매 입찰 매크로"
            description="목표가와 방식에 맞춰 구매 입찰 작업을 추가하고, 진행 상태와 실패 결과를 한 화면에서 관리합니다."
          />
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6">
        <Reveal delay={0.05}>
          <section className={`card-panel macro-running-surface p-6 ${stateResponse.state.running ? 'macro-running-surface-active' : ''}`}>
            {stateResponse.state.running ? (
              <>
                <div aria-hidden className="macro-running-aurora" />
                <div aria-hidden className="macro-running-sheen" />
                <div aria-hidden className="macro-running-scanlines" />
              </>
            ) : null}
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Macro Controls</p>
              <h2 className="mt-2 text-2xl font-bold">실행 제어</h2>
              <p className="mt-2 text-sm text-text-secondary">구매 입찰 작업은 목표가와 방식을 정확히 넣어야 안정적으로 동작합니다.</p>
              <div className="mt-5 grid gap-4">
                <LoopAccountSlot
                  kind="im-loop"
                  accounts={loopAccounts}
                  selectedAccountId={selectedAccount?.id}
                  autoSelected={loopSelection.autoSelected}
                  running={stateResponse.state.running}
                />
                <MacroControlBar kind="im-loop" accountId={selectedAccount?.id} running={stateResponse.state.running} canStart={canStart} addHref={`${basePath}?modal=add`} options={stateResponse.state.options} />
              </div>
            </div>
          </section>
        </Reveal>
        <Reveal delay={0.1}>
          <GeneralLoopStateCard
            state={stateResponse.state}
            currentTaskSummary={
              currentTask
                ? {
                    productId: currentTask.productId,
                    productName: currentTask.productName,
                    optionCount: 1,
                  }
                : null
            }
            statusCards={[
              { label: '대기 중', count: pendingTasks.length, href: `${basePath}?modal=pending`, tone: 'pending' },
              { label: '성공', count: successTasks.length, href: `${basePath}?modal=success`, tone: 'success' },
              { label: '실패', count: failedTasks.length, href: `${basePath}?modal=failed`, tone: 'failed' },
            ]}
            secondaryActions={<MacroSecondaryActions kind="im-loop" accountId={selectedAccount?.id} clearEnabled={pendingTasks.length + failedTasks.length > 0} running={stateResponse.state.running} logsHref={`${basePath}?modal=logs`} />}
          />
        </Reveal>
      </div>
      <MacroPageModals
        kind="im-loop"
        basePath={basePath}
        accountId={selectedAccount?.id}
        initialModal={modal}
        running={stateResponse.state.running}
        pendingTasks={pendingTasks}
        successTasks={successTasks}
        failedTasks={failedTasks}
      />
    </>
  );
}
