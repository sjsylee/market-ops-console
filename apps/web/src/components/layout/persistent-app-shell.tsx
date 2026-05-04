'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EventStreamProvider, useEventStreamEvent } from '../events/event-stream-provider';
import { BottomNav } from './bottom-nav';
import { MobileScrollFab } from './mobile-scroll-fab';
import { Navbar } from './navbar';
import { SidebarNav } from './sidebar-nav';

export function PersistentAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shellHidden = pathname === '/login' || pathname.startsWith('/login/');

  if (shellHidden) {
    return <>{children}</>;
  }

  return (
    <EventStreamProvider>
      <PersistentAppShellContent>{children}</PersistentAppShellContent>
    </EventStreamProvider>
  );
}

function PersistentAppShellContent({ children }: { children: ReactNode }) {
  const jobsRunning = useJobsRunningFlag(true);

  return (
    <div className="app-background min-h-screen text-text-primary">
      <div className="orb orb-blue" />
      <div className="orb orb-indigo" />
      <div className="noise-layer" />
      <Navbar />
      <div className="relative mx-auto flex w-full max-w-7xl gap-6 px-3 pb-24 pt-8 sm:px-6 xl:pb-16">
        <SidebarNav jobsRunning={jobsRunning} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <MobileScrollFab />
      <BottomNav jobsRunning={jobsRunning} />
    </div>
  );
}

function useJobsRunningFlag(enabled: boolean) {
  const [running, setRunning] = useState(false);
  const lastRefreshAtRef = useRef(0);
  const scheduledRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disposedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs/running', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as { running?: unknown };
      if (!disposedRef.current) {
        setRunning(payload.running === true);
      }
    } catch {
      // 메뉴 배지는 보조 UX라 조회 실패는 조용히 무시합니다.
    }
  }, []);

  const scheduleRefresh = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRefreshAtRef.current;

    if (elapsed >= 800) {
      lastRefreshAtRef.current = now;
      void refresh();
      return;
    }

    if (!scheduledRefreshRef.current) {
      scheduledRefreshRef.current = setTimeout(() => {
        scheduledRefreshRef.current = null;
        lastRefreshAtRef.current = Date.now();
        void refresh();
      }, 800 - elapsed);
    }
  }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      setRunning(false);
      return;
    }

    disposedRef.current = false;

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        scheduleRefresh();
      }
    }

    void refresh();
    window.addEventListener('focus', scheduleRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposedRef.current = true;
      window.removeEventListener('focus', scheduleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
    };
  }, [enabled, refresh, scheduleRefresh]);

  const handleLoopEvent = useCallback((event: Record<string, unknown>) => {
    const state = event.state;
    if (state && typeof state === 'object' && (state as Record<string, unknown>).running === true) {
      setRunning(true);
      return;
    }

    if (event.type === 'state' || event.type === 'ended') {
      scheduleRefresh();
    }
  }, [scheduleRefresh]);

  useEventStreamEvent('general-loop', handleLoopEvent, enabled);
  useEventStreamEvent('bp-loop', handleLoopEvent, enabled);
  useEventStreamEvent('im-loop', handleLoopEvent, enabled);
  useEventStreamEvent('lowest-loop', handleLoopEvent, enabled);

  return running;
}
