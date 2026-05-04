import type { AuthUser } from '@market-ops/shared';

const demoUser: AuthUser = {
  id: 'demo-user',
  email: 'demo@market-ops.local',
  role: 'ADMIN',
};

export async function getAuthenticatedUserOrNull() {
  return demoUser;
}

export async function requireAuthenticatedUser(_nextPath?: string): Promise<AuthUser> {
  return demoUser;
}

export function requireAuthenticatedPage(_nextPath?: string) {
  return;
}
