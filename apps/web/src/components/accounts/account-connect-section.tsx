'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { AccountLogoutSection } from './account-logout-section';
import type { DemoAccountMode } from './account-auth-panel';
import { ModalOverlay } from '../ui/modal-overlay';

const AccountAuthPanel = dynamic(
  () => import('./account-auth-panel').then((mod) => mod.AccountAuthPanel),
  { ssr: false },
);

export function AccountConnectSection({
  ilbanSlotsRemaining,
  hasValidBp,
  hasExpiredBp,
}: {
  ilbanSlotsRemaining: number;
  hasValidBp: boolean;
  hasExpiredBp: boolean;
}) {
  const [openMode, setOpenMode] = useState<DemoAccountMode | null>(null);
  const ilbanDisabled = ilbanSlotsRemaining <= 0;
  const bpDisabled = hasValidBp;

  return (
    <div className="grid gap-4">
      <section className="card-panel p-6">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Add Demo Account</p>
        <h2 className="mt-2 text-2xl font-bold">새 계정 추가</h2>
        <p className="mt-2 text-sm text-text-secondary">일반 계정 또는 입점 계정을 추가한 뒤, 아래 목록에서 작업 기준 계정을 선택합니다.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:items-stretch">
          <button
            type="button"
            onClick={() => setOpenMode('ILBAN')}
            disabled={ilbanDisabled}
            className={[
              'flex min-h-[8.5rem] items-center justify-between rounded-3xl border px-5 py-4 text-left transition xl:min-h-[9rem]',
              ilbanDisabled
                ? 'cursor-not-allowed border-subtle bg-bg-card/35 opacity-55'
                : 'border-subtle bg-bg-card/65 hover:border-glow hover:bg-bg-card-hover',
            ].join(' ')}
          >
            <div>
              <p className="text-lg font-semibold text-text-primary">일반 계정 추가</p>
              <p className="mt-1 text-sm text-text-secondary">
                {ilbanDisabled ? '일반 계정 슬롯이 모두 사용 중입니다.' : '일반 운영 계정을 바로 연결합니다.'}
              </p>
            </div>
            <Plus size={18} className="text-accent-primary" />
          </button>
          <button
            type="button"
            onClick={() => setOpenMode('BP')}
            disabled={bpDisabled}
            className={[
              'flex min-h-[8.5rem] items-center justify-between rounded-3xl border px-5 py-4 text-left transition xl:min-h-[9rem]',
              bpDisabled
                ? 'cursor-not-allowed border-subtle bg-bg-card/35 opacity-55'
                : 'border-subtle bg-bg-card/65 hover:border-glow hover:bg-bg-card-hover',
            ].join(' ')}
          >
            <div>
              <p className="text-lg font-semibold text-text-primary">{hasExpiredBp ? '입점 계정 재로그인' : '입점 계정 추가'}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {bpDisabled
                  ? '이미 인증된 입점 계정이 있습니다.'
                  : hasExpiredBp
                    ? '24시간 인증이 만료되어 OTP 재인증이 필요합니다.'
                    : '인증 요청 후 OTP 확인을 거쳐 연결합니다.'}
              </p>
            </div>
            <Plus size={18} className="text-accent-primary" />
          </button>
        </div>
      </section>

      <div className="hidden xl:block">
        <AccountLogoutSection />
      </div>

      <ModalOverlay open={Boolean(openMode)} onClose={() => setOpenMode(null)} maxWidthClass="max-w-xl">
        {openMode ? <AccountAuthPanel mode={openMode} onClose={() => setOpenMode(null)} /> : null}
      </ModalOverlay>
    </div>
  );
}
