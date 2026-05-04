'use client';

import type { UserNotification, UserNotificationSource, UserNotificationType } from '@market-ops/shared';
import {
  Bell,
  BellRing,
  Bot,
  ChevronRight,
  CircleAlert,
  Clock3,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '../../lib/cn';
import {
  getNotificationsClient,
  getNotificationSummaryClient,
  enableWebPushNotificationsClient,
  getWebPushSupportStatus,
  isWebPushSupported,
  markAllNotificationsReadClient,
  markNotificationReadClient,
} from '../../lib/notifications-client';

type NotificationFilter = 'all' | 'unread';
type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading';

function getNotificationMeta(type: UserNotificationType, source: UserNotificationSource) {
  if (source === 'GENERAL_LOOP' || source === 'IM_LOOP' || source === 'BP_LOOP' || source === 'LOWEST_LOOP') {
    if (type === 'SUCCESS') {
      return { icon: Sparkles, badgeClassName: 'notification-badge-success' };
    }
    if (type === 'ERROR') {
      return { icon: CircleAlert, badgeClassName: 'notification-badge-warning' };
    }
    return { icon: Bot, badgeClassName: 'notification-badge-macro' };
  }

  switch (type) {
    case 'SUCCESS':
      return {
        icon: Sparkles,
        badgeClassName: 'notification-badge-success',
      };
    case 'WARNING':
    case 'ERROR':
      return {
        icon: CircleAlert,
        badgeClassName: 'notification-badge-warning',
      };
    case 'INFO':
    default:
      return {
        icon: Info,
        badgeClassName: 'notification-badge-system',
      };
  }
}

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}일 전`;
}

function sourceLabel(source: UserNotificationSource) {
  switch (source) {
    case 'GENERAL_LOOP':
      return '일반 보관';
    case 'IM_LOOP':
      return '구매 입찰';
    case 'BP_LOOP':
      return 'BP 보관';
    case 'CURRENT_SYNC':
      return 'Current Sync';
    case 'LOWEST_LOOP':
      return '최저가 루프';
    case 'SYSTEM':
    default:
      return '시스템';
  }
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState<PushPermissionState>('default');
  const [pushNotice, setPushNotice] = useState<string | null>(null);

  async function refreshNotifications(nextFilter = filter) {
    setLoading((current) => current || notifications.length === 0);
    try {
      const [list, summary] = await Promise.all([
        getNotificationsClient({ unreadOnly: nextFilter === 'unread', limit: 30 }),
        getNotificationSummaryClient(),
      ]);
      setNotifications(list.items);
      setUnreadCount(summary.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void getNotificationSummaryClient()
      .then((summary) => setUnreadCount(summary.unreadCount))
      .catch(() => setUnreadCount(0));

    const pushSupport = getWebPushSupportStatus();
    if (!pushSupport.supported) {
      setPushPermission('unsupported');
      setPushNotice(pushSupport.message);
      return;
    }

    setPushPermission(Notification.permission);
    setPushNotice(null);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void refreshNotifications(filter);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  async function handleMarkAllRead() {
    await markAllNotificationsReadClient();
    await refreshNotifications(filter);
  }

  async function handleMarkRead(item: UserNotification) {
    if (!item.readAt) {
      await markNotificationReadClient(item.id);
      setNotifications((current) =>
        current.map((row) => (row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row)),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  }

  async function handleFilterChange(nextFilter: NotificationFilter) {
    setFilter(nextFilter);
    if (open) {
      await refreshNotifications(nextFilter);
    }
  }

  async function handleEnablePush() {
    setPushPermission('loading');
    setPushNotice(null);
    try {
      await enableWebPushNotificationsClient();
      setPushPermission(Notification.permission === 'granted' ? 'granted' : Notification.permission);
      setPushNotice('성공·실패 알림을 기기로 받을 수 있습니다.');
    } catch (error) {
      const support = getWebPushSupportStatus();
      setPushPermission(support.supported ? Notification.permission : 'unsupported');
      setPushNotice(error instanceof Error ? error.message : support.message);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="알림 센터 열기"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-bg-card text-text-secondary transition hover:border-glow hover:text-text-primary"
      >
        <Bell size={16} />
        {unreadCount > 0 ? <span aria-hidden className="nav-alert-dot notification-trigger-dot" /> : null}
      </button>

      <div
        aria-hidden={!open}
        className={cn('notification-drawer-backdrop', open ? 'notification-drawer-backdrop-visible' : 'notification-drawer-backdrop-hidden')}
        onClick={() => setOpen(false)}
      />

      <aside
        aria-hidden={!open}
        className={cn('notification-drawer-panel', open ? 'notification-drawer-panel-open' : 'notification-drawer-panel-closed')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-subtle px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Push Alerts</p>
            <h2 className="mt-2 text-2xl font-bold">알림 센터</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="알림 센터 닫기"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-[color:var(--modal-elevated)] text-text-secondary transition hover:border-glow hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-subtle bg-bg-card/70 px-3 py-1.5 text-xs text-text-secondary">
            <BellRing size={14} className="text-accent-primary" />
            <span>읽지 않은 알림 {unreadCount}건</span>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={!unreadCount}
            className="text-xs font-semibold text-accent-primary transition hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            모두 읽음
          </button>
        </div>

        <div className="border-b border-subtle px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => void handleEnablePush()}
            disabled={pushPermission === 'unsupported' || pushPermission === 'denied' || pushPermission === 'granted' || pushPermission === 'loading'}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-xs transition',
              pushPermission === 'granted'
                ? 'notification-push-toggle-enabled'
                : 'border-subtle bg-bg-card/70 text-text-secondary hover:border-glow hover:text-text-primary',
              'disabled:cursor-not-allowed disabled:opacity-75',
            )}
          >
            <span className="min-w-0">
              <span className="block font-semibold text-text-primary">
                {pushPermission === 'granted'
                  ? '모바일 푸쉬 알림 켜짐'
                  : pushPermission === 'denied'
                    ? '브라우저에서 알림이 차단됨'
                    : pushPermission === 'unsupported'
                      ? '이 브라우저는 푸쉬 미지원'
                      : pushPermission === 'loading'
                        ? '푸쉬 알림 연결 중'
                        : '모바일 푸쉬 알림 켜기'}
              </span>
              <span className="mt-1 block text-text-muted">
                {pushPermission === 'granted'
                  ? '성공·실패 알림을 기기로 받을 수 있습니다.'
                  : pushPermission === 'denied'
                    ? '브라우저 설정에서 알림 권한을 허용해 주세요.'
                    : '홈 화면에 추가한 iOS/Android 웹 앱에서도 사용할 수 있습니다.'}
              </span>
            </span>
            <BellRing size={16} className="shrink-0 text-accent-primary" />
          </button>
          {pushNotice ? (
            <p className="mt-2 rounded-2xl border border-subtle bg-bg-card/55 px-3 py-2 text-xs leading-relaxed text-text-muted">
              {pushNotice}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-subtle px-4 py-3 sm:px-6">
          {(['all', 'unread'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void handleFilterChange(item)}
              className={cn(
                'h-9 rounded-full border px-3 text-center text-xs font-semibold leading-none transition',
                filter === item
                  ? 'border-glow bg-accent-primary/12 text-text-primary'
                  : 'border-subtle bg-bg-card text-text-secondary hover:border-glow hover:text-text-primary',
              )}
            >
              {item === 'all' ? '전체' : '읽지 않음'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5">
          {loading ? (
            <div className="rounded-2xl border border-subtle bg-bg-card/45 p-5 text-sm text-text-secondary">알림을 불러오는 중입니다.</div>
          ) : notifications.length ? (
            <div className="grid gap-3">
              {notifications.map((item) => {
                const { icon: Icon, badgeClassName } = getNotificationMeta(item.type, item.source);
                const unread = !item.readAt;
                const content = (
                  <article className={cn('notification-card w-full', unread ? 'notification-card-unread' : 'notification-card-read')}>
                    <div className="flex items-start gap-3">
                      <div className={cn('notification-icon-shell', badgeClassName)}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              <span className="macro-attempt-pill">{sourceLabel(item.source)}</span>
                              <span className={cn('macro-attempt-pill', item.type === 'SUCCESS' ? 'status-badge-success' : item.type === 'ERROR' ? 'status-badge-failed' : 'status-badge-info')}>
                                {item.type === 'SUCCESS' ? '성공' : item.type === 'ERROR' ? '실패' : item.type === 'WARNING' ? '주의' : '안내'}
                              </span>
                            </div>
                            <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</h3>
                            <p className="mt-1 break-words text-sm leading-6 text-text-secondary">{item.message}</p>
                            {item.payload?.productName ? (
                              <p className="product-title mt-2 break-words text-xs leading-5 text-text-muted">
                                {item.payload.productName}
                                {item.payload.options?.length ? ` · ${item.payload.options.join(', ')}` : ''}
                              </p>
                            ) : null}
                          </div>
                          {unread ? <span className="notification-unread-dot" aria-hidden /> : null}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                            <Clock3 size={12} />
                            {formatRelativeTime(item.createdAt)}
                          </span>
                          {item.linkPath ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-primary">
                              자세히 보기
                              <ChevronRight size={12} />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );

                return item.linkPath ? (
                  <Link key={item.id} href={item.linkPath} onClick={() => void handleMarkRead(item)} className="block min-w-0">
                    {content}
                  </Link>
                ) : (
                  <button key={item.id} type="button" onClick={() => void handleMarkRead(item)} className="block w-full min-w-0 text-left">
                    {content}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">
              표시할 알림이 없습니다.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
