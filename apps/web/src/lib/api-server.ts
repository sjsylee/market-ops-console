import { mockApiGet } from './mock-data';

export class ApiServerError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
  }
}

export async function apiGetServer<T>(path: string) {
  return (await mockApiGet(path)) as T;
}
