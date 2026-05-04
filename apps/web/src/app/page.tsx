import Link from 'next/link';
import {
  Activity,
  BellRing,
  Boxes,
  CheckCircle2,
  Gauge,
  Laptop,
  LineChart,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Zap,
} from 'lucide-react';

import { Reveal } from '../components/ui/reveal';
import { createPageMetadata } from '../lib/page-metadata';

export const metadata = createPageMetadata(
  '서비스 소개',
  '마켓 운영, 입찰 관리, 가격 작업을 웹과 모바일에서 안정적으로 관리하는 운영 콘솔입니다.',
);

const outcomes = [
  { value: '24h', label: '상태를 놓치지 않는 운영 흐름' },
  { value: '1곳', label: '입찰·작업·알림을 모아보는 콘솔' },
  { value: 'Web/Mobile', label: '책상 앞과 이동 중 모두 대응' },
];

const benefits = [
  {
    icon: Activity,
    title: '입찰 현황을 한눈에',
    description: '보관 판매와 일반 판매 입찰을 상품 단위로 정리하고, 가격·수수료·최고 입찰 흐름을 빠르게 확인합니다.',
  },
  {
    icon: Boxes,
    title: '반복 작업은 큐로 관리',
    description: '대기, 진행, 성공, 실패 상태를 작업별로 분리해 운영자가 다음 액션을 바로 판단할 수 있습니다.',
  },
  {
    icon: BellRing,
    title: '놓치기 쉬운 상태를 알림으로',
    description: '동기화 완료, 작업 실패, 확인이 필요한 계정 상태를 알림으로 모아 장시간 운영 부담을 줄입니다.',
  },
  {
    icon: ShieldCheck,
    title: '운영 경계를 지키는 설계',
    description: '계정별 기준과 작업 상태를 분리해 여러 작업이 동시에 돌아가도 흐름이 섞이지 않도록 구성했습니다.',
  },
];

const workflows = [
  { icon: RefreshCw, title: '데이터 동기화', text: '입찰 목록과 상품 상태를 최신 기준으로 맞춥니다.' },
  { icon: SlidersHorizontal, title: '가격 조정', text: '상품별 가격 기준과 작업 옵션을 빠르게 확인합니다.' },
  { icon: LineChart, title: '운영 추적', text: '작업 성공률, 실패 사유, 큐 상태를 누적해서 봅니다.' },
];

export default function DemoPage() {
  return (
    <div className="landing-page -mt-3 grid gap-14 pb-6 sm:gap-16">
      <section className="landing-hero relative isolate min-h-[620px] overflow-hidden rounded-lg border border-subtle px-5 py-8 sm:min-h-[640px] sm:px-8 lg:px-12">
        <div aria-hidden className="landing-hero-scene">
          <div className="landing-dashboard">
            <div className="landing-dashboard-top">
              <span />
              <span />
              <span />
            </div>
            <div className="landing-dashboard-grid">
              <div className="landing-metric running">
                <small>실행 중</small>
                <strong>4</strong>
              </div>
              <div className="landing-metric">
                <small>대기 작업</small>
                <strong>128</strong>
              </div>
              <div className="landing-chart">
                <i style={{ height: '42%' }} />
                <i style={{ height: '68%' }} />
                <i style={{ height: '54%' }} />
                <i style={{ height: '82%' }} />
                <i style={{ height: '64%' }} />
              </div>
              <div className="landing-table">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
          <div className="landing-phone">
            <div className="landing-phone-notch" />
            <div className="landing-phone-status">
              <span>입찰 관리</span>
              <strong>안정</strong>
            </div>
            <div className="landing-phone-list">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="landing-hero-copy relative z-10 flex min-h-[560px] max-w-3xl flex-col justify-center py-10 sm:min-h-[560px]">
          <Reveal>
            <p className="inline-flex w-fit rounded-full border border-glow bg-bg-card/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-primary">
              Market Operations Console
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-text-primary sm:text-5xl lg:text-6xl">
              입찰과 반복 작업을 더 안정적으로 운영하세요
            </h1>
            <p className="mt-5 max-w-2xl break-keep text-base leading-7 text-text-secondary sm:text-lg">
              상품 입찰, 가격 기준, 반복 작업 상태를 한 화면에서 관리합니다. 웹과 모바일 어디서든 운영 흐름을 확인하고 필요한 조치를 바로 이어갈 수 있습니다.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/home" className="btn-primary min-w-36 justify-center">콘솔 둘러보기</Link>
              <Link href="/current" className="btn-secondary min-w-36 justify-center">입찰 관리 보기</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {outcomes.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.04}>
            <div className="landing-stat rounded-lg border border-subtle p-5">
              <p className="text-3xl font-black text-text-primary">{item.value}</p>
              <p className="mt-2 break-keep text-sm leading-6 text-text-secondary">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <Reveal>
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-primary">Operational Control</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-text-primary sm:text-4xl">
              바쁜 운영자가 바로 이해할 수 있는 화면
            </h2>
            <p className="mt-4 break-keep text-sm leading-7 text-text-secondary sm:text-base">
              작업이 잘 돌고 있는지, 어떤 상품을 봐야 하는지, 어디서 실패가 났는지를 빠르게 파악하도록 구성했습니다. 복잡한 설정 화면보다 운영 판단에 필요한 정보가 먼저 보입니다.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((item, index) => (
            <Reveal key={item.title} delay={0.05 * index}>
              <article className="landing-feature rounded-lg border border-subtle p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-subtle bg-bg-card text-accent-primary">
                  <item.icon size={18} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 break-keep text-sm leading-6 text-text-secondary">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="landing-band rounded-lg border border-subtle p-5 sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-primary">Responsive Operations</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-text-primary sm:text-4xl">
                사무실에서는 크게, 이동 중에는 빠르게
              </h2>
              <p className="mt-4 break-keep text-sm leading-7 text-text-secondary sm:text-base">
                데스크톱에서는 전체 현황을 넓게 보고, 모바일에서는 입찰 상태와 작업 알림을 빠르게 확인합니다. 같은 운영 흐름을 화면 크기에 맞춰 끊기지 않게 제공합니다.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="landing-chip"><Laptop size={15} /> Web Dashboard</span>
                <span className="landing-chip"><Smartphone size={15} /> Mobile Check</span>
                <span className="landing-chip"><Gauge size={15} /> Stable Loop Status</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="landing-device-row">
              <div className="landing-device desktop">
                <div className="device-bar" />
                <div className="device-content">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="landing-device mobile">
                <div className="device-bar" />
                <div className="device-content">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {workflows.map((item, index) => (
          <Reveal key={item.title} delay={0.05 * index}>
            <article className="landing-workflow rounded-lg border border-subtle p-5">
              <item.icon className="text-accent-primary" size={22} />
              <h3 className="mt-4 text-lg font-bold text-text-primary">{item.title}</h3>
              <p className="mt-2 break-keep text-sm leading-6 text-text-secondary">{item.text}</p>
            </article>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <section className="landing-cta rounded-lg border border-glow p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-glow bg-bg-card text-accent-primary">
            <Zap size={22} />
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight text-text-primary sm:text-4xl">
            운영 흐름을 한 번에 확인해보세요
          </h2>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-sm leading-7 text-text-secondary sm:text-base">
            데모 콘솔에는 입찰 관리, 작업 큐, 알림, 가격 흐름이 샘플 데이터로 구성되어 있습니다. 실제 사용 흐름처럼 화면을 이동하며 확인할 수 있습니다.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/home" className="btn-primary justify-center"><CheckCircle2 size={16} /> 대시보드 시작</Link>
            <Link href="/jobs" className="btn-secondary justify-center"><MonitorSmartphone size={16} /> 작업 화면 보기</Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
