'use client';

import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';

import { loginWithPassword } from '../../lib/auth-client';

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await loginWithPassword({ email, password });
      window.location.assign(nextPath || '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-panel w-full max-w-md p-7 sm:p-8">
      <p className="text-xs uppercase tracking-[0.14em] text-accent-primary/85">Admin Access</p>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight">Enter the Control Room</h1>
      <p className="mt-3 text-sm text-text-secondary">
        운영 현황을 확인하고 필요한 작업을 안전하게 관리합니다.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-text-secondary">Email</span>
          <span className="flex h-12 items-center gap-3 rounded-2xl border border-subtle bg-bg-card/80 px-4 focus-within:border-glow">
            <Mail size={16} className="text-text-muted" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              placeholder="admin@example.com"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-text-secondary">Password</span>
          <span className="flex h-12 items-center gap-3 rounded-2xl border border-subtle bg-bg-card/80 px-4 focus-within:border-glow">
            <LockKeyhole size={16} className="text-text-muted" />
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              placeholder="비밀번호 입력"
            />
          </span>
        </label>
      </div>

      {error ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full gap-2 disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
        <span>{submitting ? '로그인 중...' : '로그인'}</span>
      </button>
    </form>
  );
}
