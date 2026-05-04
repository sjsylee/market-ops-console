import { redirect } from 'next/navigation';

import { LoginForm } from '../../components/auth/login-form';
import { getAuthenticatedUserOrNull } from '../../lib/auth';
import { createPageMetadata } from '../../lib/page-metadata';

export const metadata = createPageMetadata(
  'Login',
  'Market Ops Console 운영 콘솔에 로그인합니다.',
);

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getAuthenticatedUserOrNull();

  if (user) {
    redirect('/');
  }

  return (
    <main className="app-background relative flex min-h-screen items-start justify-center px-4 pb-10 pt-10 sm:pt-14">
      <div className="orb orb-blue" />
      <div className="orb orb-indigo" />
      <div className="noise-layer" />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm nextPath={searchParams?.next} />
      </div>
    </main>
  );
}
