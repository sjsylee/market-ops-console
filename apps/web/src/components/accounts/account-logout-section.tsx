'use client';

import { LogoutButton } from '../auth/logout-button';

export function AccountLogoutSection({ className }: { className?: string }) {
  return (
    <section className={['card-panel p-6', className].filter(Boolean).join(' ')}>
      <h2 className="text-2xl font-bold">계정 로그아웃</h2>
      <LogoutButton className="mt-5 w-full justify-center" />
    </section>
  );
}
