import Link from 'next/link';
import { Activity, Boxes, DatabaseZap, Eye, ShieldCheck } from 'lucide-react';

import { Reveal } from '../../components/ui/reveal';
import { createPageMetadata } from '../../lib/page-metadata';

export const metadata = createPageMetadata(
  'Portfolio Demo',
  '백엔드 없이 목업 데이터로 동작하는 마켓 운영 콘솔 포트폴리오 데모입니다.',
);

const highlights = [
  {
    icon: Activity,
    title: '입찰 운영 화면',
    description: '보관/일반 입찰 목록, 가격 상태, 동기화 진행률을 한 화면에서 확인하는 흐름을 보여줍니다.',
  },
  {
    icon: Boxes,
    title: '작업 큐 콘솔',
    description: '반복 작업의 대기, 성공, 실패 상태와 계정별 실행 경계를 대시보드 형태로 구성했습니다.',
  },
  {
    icon: DatabaseZap,
    title: '목업 데이터 레이어',
    description: '실제 API와 민감 로직은 제거하고, 동일한 UI 계약을 데모 데이터로 대체했습니다.',
  },
];

export default function DemoPage() {
  return (
    <div className="grid gap-6">
      <Reveal>
        <section className="card-panel overflow-hidden p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.12em] text-accent-primary/85">Portfolio Build</p>
          <h1 className="hero-title mt-3 text-3xl font-black leading-tight text-text-primary sm:text-5xl">
            Market Ops Console Demo
          </h1>
          <p className="mt-4 max-w-3xl break-keep text-sm leading-6 text-text-secondary sm:text-base">
            실제 운영 서비스의 웹 경험을 공개 가능한 범위로 재구성한 데모입니다. 외부 플랫폼 연동, 계정 세션, 서버 실행 로직은 포함하지 않고 화면 흐름과 상태 설계만 목업 데이터로 확인할 수 있게 만들었습니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="btn-primary">대시보드 보기</Link>
            <Link href="/current" className="btn-secondary">입찰 관리 보기</Link>
          </div>
        </section>
      </Reveal>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item, index) => (
          <Reveal key={item.title} delay={0.05 * index}>
            <article className="card-panel h-full p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-subtle bg-bg-elevated text-accent-primary">
                <item.icon size={18} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-text-primary">{item.title}</h2>
              <p className="mt-2 break-keep text-sm leading-6 text-text-secondary">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </section>

      <Reveal delay={0.2}>
        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="card-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-accent-primary" size={20} />
              <h2 className="text-xl font-bold text-text-primary">공개 범위</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              <li>실제 API 서버, 데이터베이스, 플랫폼 세션 로직은 포함하지 않습니다.</li>
              <li>상품명, 계정, 작업 결과는 모두 포트폴리오용 샘플 데이터입니다.</li>
              <li>웹 UI와 상태 모델, 페이지 이동 흐름을 중심으로 확인할 수 있습니다.</li>
            </ul>
          </div>
          <div className="card-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Eye className="text-accent-primary" size={20} />
              <h2 className="text-xl font-bold text-text-primary">보는 포인트</h2>
            </div>
            <p className="mt-4 break-keep text-sm leading-6 text-text-secondary">
              화면 진입 단위의 overview 데이터, 반복 작업 상태 카드, 가격 조정 테이블, 알림/테마/모바일 내비게이션까지 운영 도구에서 자주 쓰는 흐름을 실제 제품처럼 조립했습니다.
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
