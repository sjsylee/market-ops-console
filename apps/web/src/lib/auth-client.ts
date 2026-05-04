import { authLoginResponseSchema, authLogoutResponseSchema } from '@market-ops/shared';

type LoginInput = {
  email: string;
  password: string;
};

export async function loginWithPassword(input: LoginInput) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || '로그인에 실패했습니다.');
  }

  return authLoginResponseSchema.parse(await response.json());
}

export async function logoutFromBrowser() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다.');
  }

  return authLogoutResponseSchema.parse(await response.json());
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    return null;
  }

  return null;
}
