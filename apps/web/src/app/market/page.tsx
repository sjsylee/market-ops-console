import { PriceChart } from '../../components/charts/price-chart';
import { SectionHero } from '../../components/dashboard/section-hero';
import { requireAuthenticatedPage } from '../../lib/auth';
import { Reveal } from '../../components/ui/reveal';
import { createPageMetadata } from '../../lib/page-metadata';

export const metadata = createPageMetadata(
  'Market',
  '마켓 시세와 가격 흐름을 시각적으로 확인합니다.',
);

export default async function MarketPage() {
  await requireAuthenticatedPage('/market');

  return (
    <>
      <Reveal>
        <SectionHero
          eyebrow="Market"
          title="Price Story and Trend Reading"
          description="시세 화면은 이 프로젝트의 시각 언어를 가장 잘 드러내는 영역입니다. 향후 체결가, bid/ask, 변동 폭을 이 레이아웃 위에 본격 연결합니다."
        />
      </Reveal>

      <div className="mt-6 grid gap-6">
        <Reveal delay={0.05}>
          <PriceChart />
        </Reveal>
      </div>
    </>
  );
}
