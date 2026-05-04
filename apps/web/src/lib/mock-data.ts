import {
  accountListResponseSchema,
  accountOverviewResponseSchema,
  authLoginResponseSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRefreshTokenResponseSchema,
  bpCatalogCertificateResponseSchema,
  bpLoginCompleteResponseSchema,
  bpLoginStartResponseSchema,
  bpLoopStateResponseSchema,
  bpLoopTaskListResponseSchema,
  catalogFavoriteDeleteResponseSchema,
  catalogFavoriteListResponseSchema,
  catalogFavoriteResponseSchema,
  catalogOptionsResponseSchema,
  catalogRecentTaskPresetListResponseSchema,
  catalogSearchResponseSchema,
  consoleOverviewResponseSchema,
  createAccountResponseSchema,
  currentAskPriceUpdateResponseSchema,
  currentInventoryPriceUpdateResponseSchema,
  currentListResponseSchema,
  currentPurchasePriceBulkResponseSchema,
  currentPurchasePriceResponseSchema,
  currentStatsResponseSchema,
  currentSyncControlResponseSchema,
  currentSyncStateResponseSchema,
  disconnectAccountResponseSchema,
  generalLoopStateResponseSchema,
  generalLoopTaskListResponseSchema,
  imLoopStateResponseSchema,
  imLoopTaskListResponseSchema,
  jobLogListResponseSchema,
  loopAccountSelectionResponseSchema,
  lowestLoopDetailOverviewResponseSchema,
  lowestLoopQueueItemSchema,
  lowestLoopQueueListResponseSchema,
  lowestLoopStateResponseSchema,
  macroDetailOverviewResponseSchema,
  selectedAccountResponseSchema,
  userNotificationListResponseSchema,
  userNotificationReadAllResponseSchema,
  userNotificationReadResponseSchema,
  userNotificationSummaryResponseSchema,
  userPushPublicKeyResponseSchema,
  userPushSubscriptionResponseSchema,
  type AccountSummary,
  type BpLoopTask,
  type CatalogSearchItem,
  type CurrentItem,
  type GeneralLoopTask,
  type ImLoopTask,
  type JobLogItem,
  type LoopAccountSelectionKind,
  type LowestLoopQueueItem,
  type MacroDetailOverviewKind,
  type UserNotification,
} from '@market-ops/shared';

const now = '2026-05-04T09:20:00.000Z';
const recent = '2026-05-04T09:08:00.000Z';
const older = '2026-05-04T08:42:00.000Z';
const imageA = '/product-aura-01.svg';
const imageB = '/product-aura-02.svg';
const imageC = '/brand-flow-mark.svg';

const demoUser = {
  id: 'demo-user',
  email: 'demo@market-ops.local',
  role: 'ADMIN' as const,
};

const accounts: AccountSummary[] = [
  {
    id: 'acct-retail-main',
    email: 'retail.ops@example.com',
    displayName: 'Retail Main',
    type: 'ILBAN',
    status: 'ACTIVE',
    isSelected: true,
    lastLoginAt: older,
    tokenExpiresAt: '2026-05-04T13:00:00.000Z',
    bpSessionExpiresAt: null,
    bpSessionState: null,
    createdAt: '2026-04-20T02:00:00.000Z',
    updatedAt: recent,
  },
  {
    id: 'acct-vendor-main',
    email: 'vendor.ops@example.com',
    displayName: 'Vendor Center',
    type: 'BP',
    status: 'ACTIVE',
    isSelected: false,
    lastLoginAt: older,
    tokenExpiresAt: null,
    bpSessionExpiresAt: '2026-05-04T15:30:00.000Z',
    bpSessionState: 'EXPIRING_SOON',
    createdAt: '2026-04-23T02:00:00.000Z',
    updatedAt: recent,
  },
  {
    id: 'acct-sub',
    email: 'sub.ops@example.com',
    displayName: 'Sub Account',
    type: 'ILBAN',
    status: 'ACTIVE',
    isSelected: false,
    lastLoginAt: '2026-05-03T23:10:00.000Z',
    tokenExpiresAt: '2026-05-04T12:10:00.000Z',
    bpSessionExpiresAt: null,
    bpSessionState: null,
    createdAt: '2026-04-25T02:00:00.000Z',
    updatedAt: recent,
  },
];

const acctRetail = accounts[0]!;
const acctVendor = accounts[1]!;

const selectionMap: Record<LoopAccountSelectionKind, AccountSummary> = {
  'general-loop': acctRetail,
  'bp-loop': acctVendor,
  'im-loop': acctRetail,
  'current-sync': acctRetail,
};

const catalogItems: CatalogSearchItem[] = [
  { productId: 1001201, name: 'Premium Runner Low', modelName: 'MR-2401', imgUrl: imageA, category: ['Shoes', 'Lifestyle'] },
  { productId: 1001202, name: 'City Shell Jacket', modelName: 'CJ-1260', imgUrl: imageB, category: ['Apparel', 'Outer'] },
  { productId: 1001203, name: 'Archive Tote Bag', modelName: 'AT-550', imgUrl: imageC, category: ['Accessories', 'Bag'] },
];

const firstCatalogItem = catalogItems[0]!;

const generalTasks: GeneralLoopTask[] = [
  makeGeneralTask('task-general-1', 'Premium Runner Low', 1001201, imageA, 'PENDING', 4),
  makeGeneralTask('task-general-2', 'City Shell Jacket', 1001202, imageB, 'WAITING_REQ2', 2),
  makeGeneralTask('task-general-3', 'Archive Tote Bag', 1001203, imageC, 'SUCCEEDED', 1),
];
const bpTasks: BpLoopTask[] = [
  makeBpTask('task-bp-1', 'City Shell Jacket', 1001202, imageB, 'PENDING', 6),
  makeBpTask('task-bp-2', 'Premium Runner Low', 1001201, imageA, 'FAILED', 2, '입점 세션 만료 전 재확인이 필요합니다.'),
];
const imTasks: ImLoopTask[] = [
  makeImTask('task-im-1', 'Premium Runner Low', 1001201, imageA, 'PENDING', 188000, 'p'),
  makeImTask('task-im-2', 'Archive Tote Bag', 1001203, imageC, 'SUCCEEDED', 86000, 'b'),
];

const currentItems: CurrentItem[] = [
  makeCurrentItem('current-inv-1', 2401001, 1001201, '275', 'INVENTORY', 'Premium Runner Low', imageA, 204000, 198000, 201000, true),
  makeCurrentItem('current-inv-2', 2401002, 1001202, 'L', 'INVENTORY', 'City Shell Jacket', imageB, 318000, 312000, 315000, true),
  makeCurrentItem('current-ask-1', 2402001, 1001201, '270', 'ASK', 'Premium Runner Low', imageA, 196000, 190000, 193000, false),
  makeCurrentItem('current-ask-2', 2402002, 1001203, 'OS', 'ASK', 'Archive Tote Bag', imageC, 89000, 84000, 86000, false),
];

const lowestQueue: LowestLoopQueueItem[] = [
  makeLowestQueueItem('lowest-1', 2402001, 1001201, '270', 'Premium Runner Low', imageA, 196000, 193000, true, 'OVERTAKE'),
  makeLowestQueueItem('lowest-2', 2402002, 1001203, 'OS', 'Archive Tote Bag', imageC, 89000, 86000, true, 'FOLLOW'),
  makeLowestQueueItem('lowest-3', 2401002, 1001202, 'L', 'City Shell Jacket', imageB, 318000, 315000, false, 'FOLLOW'),
];

const firstLowestQueueItem = lowestQueue[0]!;

const logs: JobLogItem[] = [
  { id: 'log-1', level: 'INFO', message: '데모 큐를 스캔하고 다음 작업을 준비했습니다.', createdAt: recent, meta: { productName: 'Premium Runner Low', productId: 1001201, imgUrl: imageA, options: ['270', '275'] } },
  { id: 'log-2', level: 'SUCCESS', message: '가격 기준이 충족되어 작업을 완료했습니다.', createdAt: older, meta: { productName: 'Archive Tote Bag', productId: 1001203, imgUrl: imageC, options: ['OS'] } },
  { id: 'log-3', level: 'WARNING', message: '세션 만료 전 재확인이 필요한 계정이 있습니다.', createdAt: '2026-05-04T08:18:00.000Z', meta: undefined },
];

const notifications: UserNotification[] = [
  { id: 'noti-1', source: 'LOWEST_LOOP', type: 'SUCCESS', title: '최저가 기준 갱신', message: '2개 상품의 입찰 기준을 최신 시세에 맞춰 갱신했습니다.', groupKey: 'lowest-loop', linkPath: '/jobs/lowest-bid', payload: { accountId: acctRetail.id }, readAt: null, createdAt: recent },
  { id: 'noti-2', source: 'BP_LOOP', type: 'WARNING', title: '입점 세션 확인 필요', message: '입점 보관 작업을 계속하려면 세션 상태를 확인해 주세요.', groupKey: 'bp-loop', linkPath: '/accounts', payload: { accountId: acctVendor.id }, readAt: null, createdAt: older },
  { id: 'noti-3', source: 'CURRENT_SYNC', type: 'INFO', title: '입찰 데이터 동기화 완료', message: '보관/일반 입찰 목록을 데모 스냅샷으로 갱신했습니다.', groupKey: 'current-sync', linkPath: '/current', payload: { accountId: acctRetail.id }, readAt: '2026-05-04T09:00:00.000Z', createdAt: older },
];

export async function mockApiRoute(request: Request, paramsPath: string[] = []) {
  const pathname = '/' + paramsPath.join('/');
  const url = new URL(request.url);

  if (pathname === '/events/stream') {
    return new Response('event: general-loop\ndata: {"type":"state"}\n\n', {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' },
    });
  }

  const body = request.method === 'GET' ? null : await readJson(request);
  const payload = resolveMockPayload(request.method, pathname, url.searchParams, body);
  return Response.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}

export async function mockApiGet(path: string) {
  const url = new URL(path, 'https://demo.market-ops.local');
  return resolveMockPayload('GET', url.pathname, url.searchParams, null);
}

function resolveMockPayload(method: string, pathname: string, searchParams: URLSearchParams, body: unknown) {
  if (pathname === '/auth/login') return authLoginResponseSchema.parse({ ok: true, user: demoUser, expiresAt: '2026-05-04T15:00:00.000Z' });
  if (pathname === '/auth/logout') return authLogoutResponseSchema.parse({ ok: true });
  if (pathname === '/auth/me') return authMeResponseSchema.parse({ ok: true, user: demoUser });
  if (pathname === '/auth/refresh') return authRefreshTokenResponseSchema.parse({ ok: true, user: demoUser, tokens: demoTokens() });

  if (pathname === '/accounts/overview') return accountOverviewResponseSchema.parse({ accounts, selectedAccount: acctRetail });
  if (pathname === '/accounts' && method === 'GET') return accountListResponseSchema.parse({ items: accounts });
  if (pathname === '/accounts' && method === 'POST') return createAccountResponseSchema.parse({ item: acctRetail });
  if (pathname === '/accounts' && method === 'DELETE') return disconnectAccountResponseSchema.parse({ item: acctRetail });
  if (pathname === '/accounts/selected') return selectedAccountResponseSchema.parse({ item: acctRetail });
  if (pathname === '/accounts/select') return createAccountResponseSchema.parse({ item: acctRetail });
  if (pathname === '/accounts/loop-selection') {
    const kind = getKind(searchParams, body);
    return loopAccountSelectionResponseSchema.parse({ item: makeSelection(kind) });
  }
  if (pathname === '/accounts/bp/login/start') return bpLoginStartResponseSchema.parse({ ok: true, email: acctVendor.email, otpRequested: true });
  if (pathname === '/accounts/bp/login/complete') return bpLoginCompleteResponseSchema.parse({ item: acctVendor, issuedAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 6 });

  if (pathname === '/overview/console') return getConsoleOverviewPayload();
  if (pathname === '/overview/macro-detail') return getMacroDetailPayload(getMacroKind(searchParams.get('kind')));
  if (pathname === '/overview/lowest-loop-detail') return getLowestLoopDetailPayload();

  if (pathname === '/jobs/running') return { running: true };
  const jobMatch = pathname.match(/^\/jobs\/(general-loop|bp-loop|im-loop)\/(state|tasks|logs|start|stop)(?:\/([^/]+))?$/);
  if (jobMatch) return resolveJobPayload(method, jobMatch[1] as MacroDetailOverviewKind, jobMatch[2]!, jobMatch[3]);

  if (pathname === '/current/sync/state') return currentSyncStateResponseSchema.parse({ ok: true, state: currentSyncState() });
  if (pathname === '/current/sync/start' || pathname === '/current/sync/stop') return currentSyncControlResponseSchema.parse({ ok: true, executionId: 'exec-current-demo', state: currentSyncState() });
  if (pathname.startsWith('/current/stats/')) return currentStatsResponseSchema.parse({ items: [currentStat()] });
  if (pathname === '/current/items') {
    const saleOrigin = searchParams.get('saleOrigin');
    return currentListResponseSchema.parse({ items: saleOrigin ? currentItems.filter((item) => item.saleOrigin === saleOrigin) : currentItems });
  }
  if (pathname === '/current/inventory/update-price') return currentInventoryPriceUpdateResponseSchema.parse({ ok: true, updated: [{ askId: 2401001, price: 198000, fee: 9900, status: 'ACTIVE' }] });
  if (pathname === '/current/ask/update-price') return currentAskPriceUpdateResponseSchema.parse({ ok: true, oldKey: 2402001, key: 2402001, price: 193000, fee: 9600, status: 'ACTIVE' });
  if (pathname === '/current/purchase-price') return currentPurchasePriceResponseSchema.parse({ ok: true, key: 2402001, purchasePrice: 175000 });
  if (pathname === '/current/purchase-price/bulk') return currentPurchasePriceBulkResponseSchema.parse({ ok: true, updatedKeys: [2402001], missingKeys: [] });

  const lowestMatch = pathname.match(/^\/current\/lowest-loop\/(state|queue|logs|start|stop)(?:\/([^/]+))?$/);
  if (lowestMatch) return resolveLowestPayload(method, lowestMatch[1]!, lowestMatch[2]);

  if (pathname === '/catalog/search' || pathname === '/catalog/bp/search') return catalogSearchResponseSchema.parse({ items: catalogItems });
  const optionsMatch = pathname.match(/^\/catalog\/products\/(\d+)\/options$/);
  if (optionsMatch) return catalogOptionsResponseSchema.parse(makeCatalogOptions(Number(optionsMatch[1]!)));
  const certificateMatch = pathname.match(/^\/catalog\/bp\/products\/(\d+)\/certificate$/);
  if (certificateMatch) {
    const options = makeCatalogOptions(Number(certificateMatch[1]!));
    return bpCatalogCertificateResponseSchema.parse({ productId: options.productId, productName: options.productName, imgUrl: options.imgUrl, category: ['Demo'], options: options.options.map((option) => option.key) });
  }
  if (pathname === '/catalog/favorites' && method === 'GET') return catalogFavoriteListResponseSchema.parse({ items: catalogItems.slice(0, 2) });
  if (pathname === '/catalog/favorites' && method === 'POST') return catalogFavoriteResponseSchema.parse({ item: firstCatalogItem });
  if (pathname.startsWith('/catalog/favorites/')) return catalogFavoriteDeleteResponseSchema.parse({ ok: true });
  if (pathname === '/catalog/recent-task-presets') return catalogRecentTaskPresetListResponseSchema.parse({ items: [recentPreset(getMacroKind(searchParams.get('kind')))] });

  if (pathname === '/notifications') return userNotificationListResponseSchema.parse({ items: notifications, nextCursor: null });
  if (pathname === '/notifications/summary') return userNotificationSummaryResponseSchema.parse({ unreadCount: 2, bySource: { BP_LOOP: 1, LOWEST_LOOP: 1 }, byType: { SUCCESS: 1, WARNING: 1 } });
  if (pathname === '/notifications/read-all') return userNotificationReadAllResponseSchema.parse({ ok: true, updatedCount: 2 });
  if (pathname.match(/^\/notifications\/[^/]+\/read$/)) return userNotificationReadResponseSchema.parse({ ok: true, item: notifications[0] });
  if (pathname === '/notifications/push/public-key') return userPushPublicKeyResponseSchema.parse({ enabled: false, publicKey: null });
  if (pathname === '/notifications/push/subscriptions') return userPushSubscriptionResponseSchema.parse({ ok: true, enabled: false });

  return { ok: true, demo: true };
}

function resolveJobPayload(method: string, kind: MacroDetailOverviewKind, action: string, id?: string) {
  if (action === 'state' || action === 'start' || action === 'stop') {
    if (kind === 'general-loop') return generalLoopStateResponseSchema.parse({ ok: true, executionId: 'exec-general-demo', state: generalState() });
    if (kind === 'bp-loop') return bpLoopStateResponseSchema.parse({ ok: true, executionId: 'exec-bp-demo', state: bpState() });
    return imLoopStateResponseSchema.parse({ ok: true, executionId: 'exec-im-demo', state: imState() });
  }
  if (action === 'logs') return jobLogListResponseSchema.parse({ items: logs });
  if (action === 'tasks') {
    if (method === 'DELETE') return { ok: true };
    if (id) return { ok: true, item: getTasks(kind)[0] };
    if (kind === 'general-loop') return generalLoopTaskListResponseSchema.parse({ items: generalTasks });
    if (kind === 'bp-loop') return bpLoopTaskListResponseSchema.parse({ items: bpTasks });
    return imLoopTaskListResponseSchema.parse({ items: imTasks });
  }
  return { ok: true };
}

function resolveLowestPayload(method: string, action: string, id?: string) {
  if (action === 'state' || action === 'start' || action === 'stop') return lowestLoopStateResponseSchema.parse({ ok: true, executionId: 'exec-lowest-demo', state: lowestState() });
  if (action === 'logs') return jobLogListResponseSchema.parse({ items: logs });
  if (action === 'queue') {
    if (method === 'GET' && !id) return lowestLoopQueueListResponseSchema.parse({ items: lowestQueue });
    if (method === 'DELETE') return { ok: true };
    return { item: lowestLoopQueueItemSchema.parse(firstLowestQueueItem) };
  }
  return { ok: true };
}

function getConsoleOverviewPayload() {
  return consoleOverviewResponseSchema.parse({
    accounts,
    selectedAccount: acctRetail,
    selections: {
      generalLoop: makeSelection('general-loop'),
      bpLoop: makeSelection('bp-loop'),
      imLoop: makeSelection('im-loop'),
      currentSync: makeSelection('current-sync'),
    },
    states: {
      generalLoop: { ok: true, executionId: 'exec-general-demo', state: generalState() },
      bpLoop: { ok: true, executionId: 'exec-bp-demo', state: bpState() },
      imLoop: { ok: true, executionId: 'exec-im-demo', state: imState() },
      currentSync: { ok: true, state: currentSyncState() },
      lowestLoop: { ok: true, executionId: 'exec-lowest-demo', state: lowestState() },
    },
    currentStats: [currentStat()],
    lowestLoopQueue: lowestQueue,
  });
}

function getMacroDetailPayload(kind: MacroDetailOverviewKind) {
  const filteredAccounts = kind === 'bp-loop' ? accounts.filter((account) => account.type === 'BP') : accounts.filter((account) => account.type === 'ILBAN');
  const state = kind === 'general-loop' ? { ok: true, executionId: 'exec-general-demo', state: generalState() } : kind === 'bp-loop' ? { ok: true, executionId: 'exec-bp-demo', state: bpState() } : { ok: true, executionId: 'exec-im-demo', state: imState() };
  return macroDetailOverviewResponseSchema.parse({ kind, accounts: filteredAccounts, selection: makeSelection(kind), state, tasks: getTasks(kind) });
}

function getLowestLoopDetailPayload() {
  return lowestLoopDetailOverviewResponseSchema.parse({ accounts: accounts.filter((account) => account.type === 'ILBAN'), selection: makeSelection('current-sync'), state: { ok: true, executionId: 'exec-lowest-demo', state: lowestState() }, queueItems: lowestQueue });
}

function makeSelection(kind: LoopAccountSelectionKind) {
  return { kind, account: selectionMap[kind], autoSelected: false };
}

function getKind(searchParams: URLSearchParams, body: unknown): LoopAccountSelectionKind {
  if (typeof body === 'object' && body && 'kind' in body && typeof body.kind === 'string') return body.kind as LoopAccountSelectionKind;
  const kind = searchParams.get('kind');
  return (kind || 'general-loop') as LoopAccountSelectionKind;
}

function getMacroKind(value: string | null): MacroDetailOverviewKind {
  return value === 'bp-loop' || value === 'im-loop' ? value : 'general-loop';
}

function generalState() {
  return { running: true, accountId: acctRetail.id, currentTaskId: 'task-general-1', cycleCount: 18, pendingCount: 6, successCount: 42, failedCount: 1, lastError: null, options: { delayPerTask: 7000, delayAfterCycle: 15000, delayAfterExceed: 15000, delayAfterIpBlock: 600000, delayAfterSecondReq: 2000, maxSecondAttempts: 3 } };
}

function bpState() {
  return { running: false, accountId: acctVendor.id, currentTaskId: null, pendingCount: 8, successCount: 31, failedCount: 2, lastError: '세션 재확인 필요', options: { delayPerTask: 7000, delayAfterCycle: 15000, delayAfterExceed: 15000, delayAfterIpBlock: 600000, delayAfterSecondReq: 3000, maxSecondAttempts: 2 } };
}

function imState() {
  return { running: true, accountId: acctRetail.id, currentTaskId: 'task-im-1', pendingCount: 4, successCount: 27, failedCount: 0, lastError: null, options: { delayPerTask: 3000, delayAfterCycle: 30000, priceTolerance: 3000, delayJitterMs: 200, burningEnabled: true, burningRepeatCount: 1, burningDelayMinMs: 200, burningDelayMaxMs: 500 } };
}

function currentSyncState() {
  return { running: true, accountId: acctRetail.id, scope: 'ALL' as const, stage: 'sync_ask' as const, total: 24, done: 17, current: { productId: 1001201, option: '270' }, lastError: null, retryState: { active: false as const } };
}

function lowestState() {
  return { running: true, accountId: acctRetail.id, stage: 'running' as const, current: { externalKey: 2402001, productId: 1001201, option: '270' }, total: lowestQueue.length, activeCount: 2, soldCount: 0, cycleCount: 12, lastError: null };
}

function currentStat() {
  return { accountId: acctRetail.id, normalCount: 14, storedCount: 10, lastSyncNormalAt: recent, lastSyncStoredAt: older, lastErrorScope: null, lastErrorCode: null, lastErrorMessage: null };
}

function getTasks(kind: MacroDetailOverviewKind) {
  if (kind === 'general-loop') return generalTasks;
  if (kind === 'bp-loop') return bpTasks;
  return imTasks;
}

function makeGeneralTask(id: string, productName: string, productId: number, imgUrl: string, status: GeneralLoopTask['status'], quantity: number, lastError: string | null = null): GeneralLoopTask {
  return { id, accountId: acctRetail.id, productId, productName, imgUrl, category: ['Demo', 'Portfolio'], options: [{ optionKey: '270', option: '270', productId, quantity }], status, retries1: 0, retries2: 0, reviewId: null, returnAddress: null, addedAt: recent, lastError, createdAt: older, updatedAt: recent };
}

function makeBpTask(id: string, productName: string, productId: number, imgUrl: string, status: BpLoopTask['status'], quantity: number, lastError: string | null = null): BpLoopTask {
  return { id, accountId: acctVendor.id, productId, productName, imgUrl, options: [{ optionKey: 'L', option: 'L', productId, quantity }], status, retries1: 0, retries2: 1, reviewId: null, returnAddress: null, addedAt: recent, lastError, createdAt: older, updatedAt: recent };
}

function makeImTask(id: string, productName: string, productId: number, imgUrl: string, status: ImLoopTask['status'], price: number, method: ImLoopTask['method']): ImLoopTask {
  return { id, accountId: acctRetail.id, productId, productName, imgUrl, category: ['Demo', 'Portfolio'], option: method === 'p' ? '270' : 'OS', price, method, status, lastError: null, createdAt: older, updatedAt: recent };
}

function makeCurrentItem(id: string, externalKey: number, productId: number, option: string, saleOrigin: CurrentItem['saleOrigin'], name: string, imgUrl: string, price: number, highestBid: number, bPrice: number, isStored: boolean): CurrentItem {
  return { id, accountId: acctRetail.id, externalKey, productId, option, saleOrigin, name, imgUrl, styleCode: 'DEMO-' + productId, category: 'Portfolio', status: 'ACTIVE', purchasePrice: price - 28000, price, fee: Math.round(price * 0.05), pPrice: price - 12000, bPrice, highestBid, isStored, isSold: false, isHidden: false, hiddenReason: null, firstSeenAt: older, lastSeenAt: recent, priceUpdatedAt: recent, lastBidActionAt: older, createdAt: older, updatedAt: recent };
}

function makeLowestQueueItem(id: string, externalKey: number, productId: number, option: string, productName: string, imgUrl: string, bidPrice: number, referencePrice: number, active: boolean, strategy: LowestLoopQueueItem['strategy']): LowestLoopQueueItem {
  return { id, accountId: acctRetail.id, externalKey, productId, option, saleOrigin: 'ASK', productName, imgUrl, bidPrice, referencePrice, active, strategy, undercutStep: 1000, budget: 1200000, spent: active ? 18000 : 0, currentPrice: referencePrice - 1000, marketUpdatedAt: recent, createdAt: older, updatedAt: recent };
}

function makeCatalogOptions(productId: number) {
  const product = catalogItems.find((item) => item.productId === productId) ?? firstCatalogItem;
  return { productId, productName: product.name, imgUrl: product.imgUrl, options: ['260', '265', '270', '275', '280', 'L', 'OS'].map((option) => ({ key: option, name: option, stockStatus: 'AVAILABLE' })) };
}

function recentPreset(kind: MacroDetailOverviewKind) {
  const product = firstCatalogItem;
  return { id: 'preset-demo-1', kind, productId: product.productId, productName: product.name, imgUrl: product.imgUrl, category: product.category, options: kind === 'im-loop' ? [{ option: '270', productId: product.productId, price: 188000, method: 'p' as const }] : [{ optionKey: '270', option: '270', productId: product.productId, quantity: 2 }], addCount: 5, lastAddedAt: recent, lastUsedAccountId: acctRetail.id };
}

function demoTokens() {
  return { accessToken: 'demo-access-token', accessTokenExpiresAt: '2026-05-04T15:00:00.000Z', refreshToken: 'demo-refresh-token', refreshTokenExpiresAt: '2026-05-05T15:00:00.000Z' };
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
