'use client';

import { LogOut } from 'lucide-react';
import { useState } from 'react';

import { logoutFromBrowser } from '../../lib/auth-client';
import { cn } from '../../lib/cn';

export function LogoutButton({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);

    try {
      await logoutFromBrowser();
      window.location.assign('/login');
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      aria-label="로그아웃"
      className={cn(
        compact
          ? 'logout-danger-button inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-70'
          : 'logout-danger-button inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition disabled:cursor-not-allowed disabled:opacity-70',
        className,
      )}
    >
      <LogOut size={16} />
      {compact ? null : <span>{pending ? '정리 중...' : '로그아웃'}</span>}
    </button>
  );
}
