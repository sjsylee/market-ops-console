import { Injectable } from '@nestjs/common';
import {
  accountListResponseSchema, accountOverviewResponseSchema, consoleOverviewResponseSchema, currentListResponseSchema, currentStatsResponseSchema, currentSyncStateResponseSchema, generalLoopStateResponseSchema, generalLoopTaskListResponseSchema, jobLogListResponseSchema, loopAccountSelectionResponseSchema, lowestLoopQueueListResponseSchema, lowestLoopStateResponseSchema, macroDetailOverviewResponseSchema, selectedAccountResponseSchema, type AccountSummary, type CurrentItem, type GeneralLoopTask, type JobLogItem, type LoopAccountSelectionKind, type MacroDetailOverviewKind, type LowestLoopQueueItem,
} from '@market-ops/shared';

const now = '2026-05-04T09:20:00.000Z';
const recent = '2026-05-04T09:08:00.000Z';
const older = '2026-05-04T08:42:00.000Z';

@Injectable()
export class DemoDataService {
  private readonly accounts: AccountSummary[] = [
    { id:'acct-retail-main', email:'retail.ops@example.com', displayName:'Retail Main', type:'ILBAN', status:'ACTIVE', isSelected:true, lastLoginAt:older, tokenExpiresAt:now, bpSessionExpiresAt:null, bpSessionState:null, createdAt:older, updatedAt:recent },
    { id:'acct-vendor-main', email:'vendor.ops@example.com', displayName:'Vendor Center', type:'BP', status:'ACTIVE', isSelected:false, lastLoginAt:older, tokenExpiresAt:null, bpSessionExpiresAt:now, bpSessionState:'EXPIRING_SOON', createdAt:older, updatedAt:recent },
  ];
  private readonly generalTasks: GeneralLoopTask[] = [
    this.makeTask('task-general-1', 'Premium Runner Low', 1001201, 'PENDING', 4),
    this.makeTask('task-general-2', 'City Shell Jacket', 1001202, 'WAITING_REQ2', 2),
  ];
  private readonly currentItems: CurrentItem[] = [
    this.makeCurrentItem('current-inv-1', 2401001, 'INVENTORY', 'Premium Runner Low', 204000, 198000),
    this.makeCurrentItem('current-ask-1', 2402001, 'ASK', 'Archive Tote Bag', 89000, 84000),
  ];
  private readonly queue: LowestLoopQueueItem[] = [
    { id:'lowest-1', accountId:'acct-retail-main', externalKey:2402001, productId:1001201, option:'270', saleOrigin:'ASK', productName:'Premium Runner Low', imgUrl:'/product-aura-01.svg', bidPrice:196000, referencePrice:193000, active:true, strategy:'OVERTAKE', undercutStep:1000, budget:1200000, spent:18000, currentPrice:192000, marketUpdatedAt:recent, createdAt:older, updatedAt:recent },
  ];
  private readonly logs: JobLogItem[] = [
    { id:'log-1', level:'INFO', message:'Demo API returned a contract-shaped runtime event.', createdAt:recent, meta:{ productName:'Premium Runner Low', productId:1001201, options:['270'] } },
  ];

  overview() {
    return consoleOverviewResponseSchema.parse({ accounts:this.accounts, selectedAccount:this.accounts[0], selections:{ generalLoop:this.selection('general-loop'), bpLoop:this.selection('bp-loop'), imLoop:this.selection('im-loop'), currentSync:this.selection('current-sync') }, states:{ generalLoop:this.generalState(), bpLoop:{...this.generalState(), state:{...this.generalState().state, running:false, accountId:this.accounts[1]!.id}}, imLoop:{...this.generalState(), state:{...this.generalState().state, pendingCount:4, successCount:27}}, currentSync:{ok:true, state:this.currentSyncState()}, lowestLoop:this.lowestState() }, currentStats:[this.currentStat()], lowestLoopQueue:this.queue });
  }
  accountOverview() { return accountOverviewResponseSchema.parse({ accounts:this.accounts, selectedAccount:this.accounts[0] }); }
  accountsList() { return accountListResponseSchema.parse({ items:this.accounts }); }
  selectedAccount() { return selectedAccountResponseSchema.parse({ item:this.accounts[0] }); }
  selection(kind: LoopAccountSelectionKind) { const account = kind === 'bp-loop' ? this.accounts[1]! : this.accounts[0]!; return loopAccountSelectionResponseSchema.parse({ item:{ kind, account, autoSelected:false } }).item; }
  macroDetail(kind: MacroDetailOverviewKind) { return macroDetailOverviewResponseSchema.parse({ kind, accounts:this.accounts, selection:this.selection(kind), state:this.generalState(), tasks:this.generalTasks }); }
  generalState() { return generalLoopStateResponseSchema.parse({ ok:true, executionId:'exec-demo', state:{ running:true, accountId:this.accounts[0]!.id, currentTaskId:'task-general-1', cycleCount:18, pendingCount:6, successCount:42, failedCount:1, lastError:null, options:{ delayPerTask:7000, delayAfterCycle:15000, delayAfterExceed:15000, delayAfterIpBlock:600000, delayAfterSecondReq:2000, maxSecondAttempts:3 } } }); }
  generalTasksList() { return generalLoopTaskListResponseSchema.parse({ items:this.generalTasks }); }
  logsList() { return jobLogListResponseSchema.parse({ items:this.logs }); }
  currentState() { return currentSyncStateResponseSchema.parse({ ok:true, state:this.currentSyncState() }); }
  currentStats() { return currentStatsResponseSchema.parse({ items:[this.currentStat()] }); }
  currentItemsList(origin?: string) { return currentListResponseSchema.parse({ items: origin ? this.currentItems.filter((item) => item.saleOrigin === origin) : this.currentItems }); }
  lowestState() { return lowestLoopStateResponseSchema.parse({ ok:true, executionId:'exec-lowest-demo', state:{ running:true, accountId:this.accounts[0]!.id, stage:'running', current:{ externalKey:2402001, productId:1001201, option:'270' }, total:this.queue.length, activeCount:1, soldCount:0, cycleCount:12, lastError:null } }); }
  lowestQueue() { return lowestLoopQueueListResponseSchema.parse({ items:this.queue }); }
  private currentSyncState() { return { running:true, accountId:this.accounts[0]!.id, scope:'ALL' as const, stage:'sync_ask' as const, total:24, done:17, current:{ productId:1001201, option:'270' }, lastError:null, retryState:{ active:false as const } }; }
  private currentStat() { return { accountId:this.accounts[0]!.id, normalCount:14, storedCount:10, lastSyncNormalAt:recent, lastSyncStoredAt:older, lastErrorScope:null, lastErrorCode:null, lastErrorMessage:null }; }
  private makeTask(id:string, productName:string, productId:number, status:GeneralLoopTask['status'], quantity:number): GeneralLoopTask { return { id, accountId:this.accounts[0]?.id || 'acct-retail-main', productId, productName, imgUrl:'/product-aura-01.svg', category:['Demo'], options:[{ optionKey:'270', option:'270', productId, quantity }], status, retries1:0, retries2:0, reviewId:null, returnAddress:null, addedAt:recent, lastError:null, createdAt:older, updatedAt:recent }; }
  private makeCurrentItem(id:string, externalKey:number, saleOrigin:CurrentItem['saleOrigin'], name:string, price:number, highestBid:number): CurrentItem { return { id, accountId:'acct-retail-main', externalKey, productId:1001201, option:'270', saleOrigin, name, imgUrl:'/product-aura-01.svg', styleCode:'DEMO-1001201', category:'Portfolio', status:'ACTIVE', purchasePrice:price-28000, price, fee:Math.round(price*0.05), pPrice:price-12000, bPrice:highestBid+3000, highestBid, isStored:saleOrigin==='INVENTORY', isSold:false, isHidden:false, hiddenReason:null, firstSeenAt:older, lastSeenAt:recent, priceUpdatedAt:recent, lastBidActionAt:older, createdAt:older, updatedAt:recent }; }
}
