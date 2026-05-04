import {
  userNotificationListResponseSchema,
  userNotificationSummaryResponseSchema,
  userPushPublicKeyResponseSchema,
  userPushSubscriptionResponseSchema,
  type UserNotificationSource,
  type UserNotificationType,
} from '@market-ops/shared';

import { apiDeleteClient, apiGetClient, apiPatchClient, apiPostClient } from './api-client';

export async function getNotificationsClient(input: {
  unreadOnly?: boolean;
  source?: UserNotificationSource;
  type?: UserNotificationType;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (input.unreadOnly) query.set('unreadOnly', 'true');
  if (input.source) query.set('source', input.source);
  if (input.type) query.set('type', input.type);
  if (input.limit) query.set('limit', String(input.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return userNotificationListResponseSchema.parse(await apiGetClient(`/api/notifications${suffix}`));
}

export async function getNotificationSummaryClient() {
  return userNotificationSummaryResponseSchema.parse(await apiGetClient('/api/notifications/summary'));
}

export async function markNotificationReadClient(id: string) {
  return apiPatchClient(`/api/notifications/${id}/read`, {});
}

export async function markAllNotificationsReadClient(input: {
  source?: UserNotificationSource;
  type?: UserNotificationType;
} = {}) {
  return apiPatchClient('/api/notifications/read-all', input);
}

export function isWebPushSupported() {
  return getWebPushSupportStatus().supported;
}

export function getWebPushSupportStatus(): { supported: true; message: null } | { supported: false; message: string } {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      message: '브라우저 환경에서만 푸쉬 알림을 설정할 수 있습니다.',
    };
  }

  if (!window.isSecureContext) {
    return {
      supported: false,
      message: '푸쉬 알림은 HTTPS 환경에서만 사용할 수 있습니다.',
    };
  }

  if (isIosBrowser() && !isStandaloneApp()) {
    return {
      supported: false,
      message: 'iOS는 홈 화면에 추가한 웹 앱에서만 푸쉬 알림 권한을 요청할 수 있습니다.',
    };
  }

  const supported =
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  return (
    supported
      ? { supported: true, message: null }
      : {
          supported: false,
          message: '이 브라우저는 웹 푸쉬 알림을 지원하지 않습니다.',
        }
  );
}

export async function getPushPublicKeyClient() {
  return userPushPublicKeyResponseSchema.parse(await apiGetClient('/api/notifications/push/public-key'));
}

export async function enableWebPushNotificationsClient() {
  const support = getWebPushSupportStatus();
  if (!support.supported) {
    throw new Error(support.message);
  }

  // iOS는 사용자 제스처 직후가 아니면 권한 프롬프트를 표시하지 않을 수 있습니다.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('브라우저 알림 권한이 허용되지 않았습니다.');
  }

  const key = await getPushPublicKeyClient();
  if (!key.enabled || !key.publicKey) {
    throw new Error('푸쉬 알림 키가 아직 설정되지 않았습니다.');
  }

  const registration = await navigator.serviceWorker.register('/push-service-worker.js');
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key.publicKey),
    }));

  return userPushSubscriptionResponseSchema.parse(
    await apiPostClient('/api/notifications/push/subscriptions', {
      ...subscription.toJSON(),
      deviceLabel: navigator.userAgent,
    }),
  );
}

function isIosBrowser() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandaloneApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

export async function disableWebPushNotificationsClient() {
  if (!isWebPushSupported()) {
    return userPushSubscriptionResponseSchema.parse({ ok: true, enabled: false });
  }

  const registration = await navigator.serviceWorker.getRegistration('/push-service-worker.js');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) {
    return userPushSubscriptionResponseSchema.parse({ ok: true, enabled: true });
  }

  await subscription.unsubscribe();
  return userPushSubscriptionResponseSchema.parse(
    await apiDeleteClient('/api/notifications/push/subscriptions', {
      endpoint: subscription.endpoint,
    }),
  );
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
