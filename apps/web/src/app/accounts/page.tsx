import { MAX_ILBAN_ACCOUNTS } from '@market-ops/shared';

import { AccountConnectSection } from '../../components/accounts/account-connect-section';
import { AccountDisconnectButton } from '../../components/accounts/account-disconnect-button';
import { AccountLogoutSection } from '../../components/accounts/account-logout-section';
import { AccountSelectButton } from '../../components/accounts/account-select-button';
import { BpSessionStatus } from '../../components/accounts/bp-session-status';
import { requireAuthenticatedPage } from '../../lib/auth';
import { SectionHero } from '../../components/dashboard/section-hero';
import { Reveal } from '../../components/ui/reveal';
import { getAccountOverview } from '../../lib/account-overview';
import { createPageMetadata } from '../../lib/page-metadata';

export const metadata = createPageMetadata(
  'Account Setup',
  '일반 운영 계정과 입점 계정을 연결하고 현재 작업 기준 계정을 관리합니다.',
);

export default async function AccountsPage() {
  await requireAuthenticatedPage('/accounts');
  const overview = await getAccountOverview();
  const accounts = overview.accounts;
  const selectedAccount = overview.selectedAccount;
  const activeIlbanCount = accounts.filter((item) => item.type === 'ILBAN' && item.status === 'ACTIVE').length;
  const hasValidBp = accounts.some((item) => item.type === 'BP' && item.status === 'ACTIVE' && item.bpSessionState !== 'EXPIRED' && item.bpSessionState !== 'UNKNOWN');
  const hasExpiredBp = accounts.some((item) => item.type === 'BP' && (item.bpSessionState === 'EXPIRED' || item.bpSessionState === 'UNKNOWN'));

  return (
    <>
      <Reveal>
        <SectionHero
          eyebrow="Accounts"
          title="Account Setup"
          description="운영 계정을 연결하고, 현재 작업 기준 계정을 선택합니다."
        />
      </Reveal>

        <div className="mt-6 grid gap-6">
        <Reveal delay={0.05}>
          <div className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr] xl:items-start">
            <section className="card-panel p-6">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Demo Accounts</p>
              <h2 className="mt-2 text-2xl font-bold">연결된 운영 계정</h2>
              <p className="mt-2 text-sm text-text-secondary">현재 연결된 운영 계정 중 하나를 선택하면 이후 입찰 관리와 매크로 화면에서 같은 기준으로 데이터를 불러옵니다.</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span className="inline-flex rounded-full border border-subtle bg-bg-card/60 px-4 py-2">
                  일반 계정 {activeIlbanCount} / {MAX_ILBAN_ACCOUNTS}
                </span>
                <span className="inline-flex rounded-full border border-subtle bg-bg-card/60 px-4 py-2">
                  입점 계정 {hasValidBp ? '인증됨' : hasExpiredBp ? '재로그인 필요' : '없음'}
                </span>
                <span className="inline-flex rounded-full border border-subtle bg-bg-card/60 px-4 py-2">
                  현재 기준 {selectedAccount?.displayName || '없음'}
                </span>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:items-stretch">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <article key={account.id} className="flex h-full min-h-[15rem] flex-col rounded-3xl border border-subtle bg-bg-card/70 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-xs uppercase tracking-[0.12em] text-text-muted">
                          {account.type === 'ILBAN' ? '일반 운영 계정' : '입점 운영 계정'}
                        </p>
                        <span className="shrink-0 whitespace-nowrap rounded-full border border-subtle px-3 py-1 text-xs font-medium text-text-secondary">
                          {account.status}
                        </span>
                      </div>
                      <div className="mt-3 min-w-0">
                        <h3 className="truncate text-lg font-semibold text-text-primary" title={account.displayName}>
                          {account.displayName}
                        </h3>
                        <p className="mt-1 truncate text-sm text-text-secondary" title={account.email}>
                          {account.email}
                        </p>
                      </div>
                      {account.type === 'BP' ? (
                        <BpSessionStatus state={account.bpSessionState} expiresAt={account.bpSessionExpiresAt} />
                      ) : null}
                      <div className="mt-auto pt-5">
                        <p className="text-sm text-text-muted">{account.isSelected ? '현재 작업 기준 계정' : '필요할 때 기준 계정으로 전환'}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <AccountSelectButton accountId={account.id} selected={account.isSelected} />
                          <AccountDisconnectButton accountId={account.id} displayName={account.displayName} />
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary lg:col-span-2">
                    아직 연결된 계정이 없습니다. 아래 연결 패널에서 계정을 먼저 추가해주세요.
                  </div>
                )}
              </div>
            </section>
            <AccountConnectSection ilbanSlotsRemaining={Math.max(0, MAX_ILBAN_ACCOUNTS - activeIlbanCount)} hasValidBp={hasValidBp} hasExpiredBp={hasExpiredBp} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <section className="card-panel p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Usage Guide</p>
            <h2 className="mt-2 text-2xl font-bold">바로 쓰는 순서</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: '1. 운영 계정 연결',
                  description: '일반 계정은 바로 연결하고, 입점 계정은 인증 요청과 OTP 확인을 마치면 목록에 추가됩니다.',
                },
                {
                  title: '2. 기준 계정 선택',
                  description: '하나를 현재 작업 기준으로 선택하면 입찰 관리와 매크로 화면이 같은 계정을 기준으로 동작합니다.',
                },
                {
                  title: '3. 필요하면 연결 해제',
                  description: '더 이상 사용하지 않는 계정은 연결 해제해 작업 목록을 정리할 수 있습니다.',
                },
              ].map((item) => (
                <article key={item.title} className="rounded-3xl border border-subtle bg-bg-card/65 p-5">
                  <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>
        <div className="xl:hidden">
          <Reveal delay={0.14}>
            <AccountLogoutSection />
          </Reveal>
        </div>
      </div>
    </>
  );
}
