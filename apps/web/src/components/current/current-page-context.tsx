import { CurrentAccountSlot } from './current-account-slot';
import { CurrentStreamRefresher } from './current-stream-refresher';
import type { AccountSummary, CurrentSyncState } from '@market-ops/shared';

export function CurrentPageContext({
  accounts,
  selectedAccount,
  autoSelected,
  syncState,
}: {
  accounts: AccountSummary[];
  selectedAccount: AccountSummary | null;
  autoSelected: boolean;
  syncState: CurrentSyncState;
}) {
  return (
    <>
      <CurrentStreamRefresher accountId={selectedAccount?.id} />
      <CurrentAccountSlot
        accounts={accounts}
        selectedAccountId={selectedAccount?.id}
        autoSelected={autoSelected}
        running={syncState.running}
      />
    </>
  );
}
