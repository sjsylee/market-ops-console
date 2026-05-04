'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type Point = { day: string; price: number };

const sample: Point[] = [
  { day: '월', price: 412000 },
  { day: '화', price: 418000 },
  { day: '수', price: 409000 },
  { day: '목', price: 425000 },
  { day: '금', price: 431000 },
  { day: '토', price: 428000 },
  { day: '일', price: 436000 },
];

export function PriceChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="card-panel h-[280px]">
      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">7D Market Trend</p>
      <div className="mt-4 h-[210px]">
        {!mounted ? (
          <div className="h-full animate-pulse rounded-2xl border border-subtle bg-bg-card/70" />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={sample}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,16,35,0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: 12,
                  color: '#f8fafc',
                }}
                formatter={(value) => {
                  const amount = typeof value === 'number' ? value : Number(value || 0);
                  return `${new Intl.NumberFormat('ko-KR').format(amount)}원`;
                }}
              />
              <Area type="monotone" dataKey="price" stroke="var(--accent-primary)" fill="url(#chartGradient)" strokeWidth={2.2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
