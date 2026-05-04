self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || 'Market Ops Console 알림';
  const options = {
    body: data.body || data.message || '새 알림이 도착했습니다.',
    tag: data.id || data.groupKey || 'market-ops-notification',
    data: {
      id: data.id,
      linkPath: data.linkPath || '/jobs',
    },
    icon: '/app-icon-symbol.svg',
    badge: '/app-icon-symbol.svg',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetPath = event.notification.data?.linkPath || '/jobs';
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && client.url.startsWith(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
