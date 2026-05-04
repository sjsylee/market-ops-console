type ClientRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function apiPostClient<T>(path: string, body: unknown) {
  return apiRequestClient<T>(path, { method: 'POST', body });
}

export async function apiDeleteClient<T>(path: string, body: unknown) {
  return apiRequestClient<T>(path, { method: 'DELETE', body });
}

export async function apiGetClient<T>(path: string) {
  return apiRequestClient<T>(path, { method: 'GET' });
}

export async function apiPatchClient<T>(path: string, body: unknown) {
  return apiRequestClient<T>(path, { method: 'PATCH', body });
}

async function apiRequestClient<T>(path: string, options: ClientRequestOptions) {
  const response = await fetchClient(path, options);

  if (response.status === 401) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      const retryResponse = await fetchClient(path, options);
      if (retryResponse.ok) {
        return (await retryResponse.json()) as T;
      }
      if (retryResponse.status !== 401) {
        throw new Error(await readMessage(retryResponse));
      }
    }

    redirectToLogin();
    throw new Error('로그인이 필요합니다.');
  }

  if (!response.ok) {
    throw new Error(await readMessage(response));
  }

  return (await response.json()) as T;
}

function fetchClient(path: string, options: ClientRequestOptions) {
  return fetch(path, {
    method: options.method,
    ...(options.method === 'GET'
      ? {}
      : {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options.body),
        }),
  });
}

async function refreshAuthSession() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function readMessage(response: Response) {
  try {
    const payload = (await response.json()) as Record<string, unknown>;
    if (typeof payload.message === 'string') {
      return payload.message;
    }
  } catch {
    return '요청 처리에 실패했습니다.';
  }

  return '요청 처리에 실패했습니다.';
}

function redirectToLogin() {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?next=${encodeURIComponent(next)}`);
}
