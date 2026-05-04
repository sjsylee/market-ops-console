'use client';

import { Loader2, Mail, ShieldCheck, Smartphone, UserRound, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { completeBpLogin, createIlbanAccount, startBpLogin } from '../../lib/accounts-client';

export type DemoAccountMode = 'ILBAN' | 'BP';

export function AccountAuthPanel({
  mode,
  onClose,
}: {
  mode: DemoAccountMode;
  onClose: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail('');
    setDisplayName('');
    setPassword('');
    setOtp('');
    setOtpRequested(false);
    setMessage(null);
    setError(null);
  }, [mode]);

  const isIlban = mode === 'ILBAN';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      if (isIlban) {
        await createIlbanAccount({ email, password, displayName: displayName.trim() || undefined });
        setMessage('일반 운영 계정을 연결했습니다.');
        resetForm();
        router.refresh();
        setTimeout(onClose, 400);
      } else if (!otpRequested) {
        await startBpLogin({ email, password });
        setOtpRequested(true);
        setMessage('입점 계정 인증 요청을 보냈습니다. OTP를 입력해주세요.');
      } else {
        await completeBpLogin({ email, password, otp });
        setMessage('입점 운영 계정을 연결했습니다.');
        resetForm();
        router.refresh();
        setTimeout(onClose, 400);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '운영 계정 연결에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  function resetForm() {
    setEmail('');
    setDisplayName('');
    setPassword('');
    setOtp('');
    setOtpRequested(false);
  }

  return (
    <section className="modal-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Demo Account Connect</p>
          <h2 className="mt-2 text-2xl font-bold">{isIlban ? '일반 운영 계정 추가' : '입점 운영 계정 추가'}</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isIlban
              ? '이 콘솔에서 사용할 일반 운영 계정을 연결합니다.'
              : '입점 계정은 인증 요청 후 OTP 확인까지 마쳐야 연결됩니다.'}
          </p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-[color:var(--modal-elevated)] text-text-secondary transition hover:border-glow hover:text-text-primary" aria-label="계정 추가 패널 닫기">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-text-secondary">Email</span>
          <span className="modal-input">
            <Mail size={16} className="text-text-muted" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full bg-transparent text-sm text-text-primary outline-none" placeholder="demo-account@example.com" />
          </span>
        </label>

        {isIlban ? (
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-secondary">표시 이름</span>
            <span className="modal-input">
              <UserRound size={16} className="text-text-muted" />
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-transparent text-sm text-text-primary outline-none" placeholder="화면에 표시할 이름" />
            </span>
          </label>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-text-secondary">Password</span>
          <span className="modal-input">
            <ShieldCheck size={16} className="text-text-muted" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="w-full bg-transparent text-sm text-text-primary outline-none" placeholder="비밀번호 입력" />
          </span>
        </label>

        {!isIlban && otpRequested ? (
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-secondary">OTP</span>
            <span className="modal-input">
              <Smartphone size={16} className="text-text-muted" />
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full bg-transparent text-sm text-text-primary outline-none" placeholder="수신한 인증 코드" />
            </span>
          </label>
        ) : null}

        {message ? <p className="feedback-success">{message}</p> : null}
        {error ? <p className="feedback-error">{error}</p> : null}

        <button type="submit" disabled={pending} className="btn-primary mt-2 w-full gap-2 disabled:cursor-not-allowed disabled:opacity-70">
          {pending ? <Loader2 size={16} className="animate-spin" /> : null}
          <span>
            {isIlban
              ? pending
                ? '연결 중...'
                : '일반 운영 계정 연결'
              : otpRequested
                ? pending
                  ? '인증 중...'
                  : '입점 계정 인증 후 연결'
                : pending
                  ? '인증 요청 중...'
                  : '입점 계정 인증 요청'}
          </span>
        </button>
      </form>
    </section>
  );
}
