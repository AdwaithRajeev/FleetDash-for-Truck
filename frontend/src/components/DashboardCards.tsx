/**
 * DashboardCards.tsx
 * KPI stat cards: Total, Moving, Stopped, Offline + 4 extended metrics.
 * Week 1 – Static dummy data only.
 * Ready for real-time data injection via props / Socket.io in Week 3.
 *
 * UI Enhancement v2: Framer Motion entrance + whileHover, animated counters,
 * SVG sparkline paths, mouse tilt, 8-card grid. All existing interfaces
 * and props preserved exactly.
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FleetStats {
  total: number;
  moving: number;
  stopped: number;
  offline: number;
}

interface StatCardData {
  id: string;
  label: string;
  value: number;
  unit?: string;
  icon: string;
  variant: 'total' | 'moving' | 'stopped' | 'offline' | 'trips' | 'speed' | 'fuel' | 'ontime';
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  trendIcon: string;
}

interface DashboardCardsProps {
  /** Stats object – defaults to dummy data when undefined (Week 1) */
  stats?: FleetStats;
}



// ── Extended static KPI dummy data (not driven by FleetStats) ─────────────────

const EXTENDED_CARDS: StatCardData[] = [
  {
    id: 'stat-trips',
    label: 'Active Trips',
    value: 23,
    icon: '🗺',
    variant: 'trips',
    trend: '+5 from yesterday',
    trendDirection: 'up',
    trendIcon: '↑',
  },
  {
    id: 'stat-speed',
    label: 'Avg Speed',
    value: 72,
    unit: ' km/h',
    icon: '⚡',
    variant: 'speed',
    trend: '+4 km/h vs last hour',
    trendDirection: 'up',
    trendIcon: '↑',
  },
  {
    id: 'stat-fuel',
    label: 'Fuel Efficiency',
    value: 91,
    unit: '%',
    icon: '⛽',
    variant: 'fuel',
    trend: '−2% vs last week',
    trendDirection: 'down',
    trendIcon: '↓',
  },
  {
    id: 'stat-ontime',
    label: 'On-Time Rate',
    value: 96,
    unit: '%',
    icon: '✅',
    variant: 'ontime',
    trend: '+1% this month',
    trendDirection: 'up',
    trendIcon: '↑',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildCards(stats: FleetStats): StatCardData[] {
  const movingPct =
    stats.total > 0 ? ((stats.moving / stats.total) * 100).toFixed(1) : '0.0';

  const stoppedPct =
    stats.total > 0 ? ((stats.stopped / stats.total) * 100).toFixed(1) : '0.0';

  return [
    {
      id: 'stat-total',
      label: 'Total Vehicles',
      value: stats.total,
      icon: '🚛',
      variant: 'total',
      trend: 'Live fleet count',
      trendDirection: 'neutral',
      trendIcon: '→',
    },
    {
      id: 'stat-moving',
      label: 'Moving',
      value: stats.moving,
      icon: '▶',
      variant: 'moving',
      trend: `${movingPct}% of fleet`,
      trendDirection: 'up',
      trendIcon: '↑',
    },
    {
      id: 'stat-stopped',
      label: 'Stopped',
      value: stats.stopped,
      icon: '⏸',
      variant: 'stopped',
      trend: `${stoppedPct}% of fleet`,
      trendDirection: 'neutral',
      trendIcon: '→',
    },
    {
      id: 'stat-offline',
      label: 'Offline',
      value: stats.offline,
      icon: '📡',
      variant: 'offline',
      trend: 'Current offline vehicles',
      trendDirection: 'down',
      trendIcon: '↓',
    },
  ];
}

// ── Sparkline bar heights per card variant (purely decorative) ────────────────

const SPARKLINE_HEIGHTS: Record<string, number[]> = {
  total:   [30, 45, 35, 55, 40, 60, 50, 70],
  moving:  [50, 60, 45, 70, 55, 75, 65, 80],
  stopped: [40, 30, 50, 35, 45, 30, 40, 35],
  offline: [20, 30, 15, 25, 20, 15, 10, 12],
  trips:   [35, 50, 42, 60, 55, 65, 58, 72],
  speed:   [55, 65, 60, 72, 68, 78, 74, 82],
  fuel:    [85, 88, 84, 90, 87, 92, 89, 91],
  ontime:  [90, 93, 91, 95, 92, 96, 94, 96],
};

// ── SVG Sparkline path ────────────────────────────────────────────────────────

const SparklinePath: React.FC<{ heights: number[]; color: string }> = memo(({ heights, color }) => {
  const W = 72, H = 32;
  const step = W / (heights.length - 1);
  const pts = heights.map((h, i) => ({ x: i * step, y: H - (h / 100) * H }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${d} L${(heights.length - 1) * step},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <motion.path
        d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
      />
    </svg>
  );
});
SparklinePath.displayName = 'SparklinePath';

// ── Animated Counter ──────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 900): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

// ── Card color map ────────────────────────────────────────────────────────────

const VARIANT_COLORS: Record<string, string> = {
  total:   '#4F8CFF',
  moving:  '#31D67B',
  stopped: '#FFB547',
  offline: '#FF5C5C',
  trips:   '#00D4FF',
  speed:   '#A78BFA',
  fuel:    '#34D399',
  ontime:  '#F9A8D4',
};

// ── Sub-component: Single stat card ───────────────────────────────────────────

const StatCard: React.FC<{ data: StatCardData; index: number }> = memo(({ data, index }) => {
  const cardRef = useRef<HTMLElement>(null);
  const animatedValue = useAnimatedCounter(data.value, 900 + index * 80);
  const color = VARIANT_COLORS[data.variant] ?? '#4F8CFF';

  const trendClass =
    data.trendDirection === 'up'
      ? 'trend-up'
      : data.trendDirection === 'down'
      ? 'trend-down'
      : 'trend-neutral';

  const sparkHeights = SPARKLINE_HEIGHTS[data.variant] ?? [40, 50, 45, 60, 55, 65, 58, 70];

  // Mouse tilt (3D perspective) effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-8px) scale(1.02) perspective(700px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
  }, []);

  return (
    <motion.article
      ref={cardRef}
      id={data.id}
      className={`stat-card stat-card--${data.variant}`}
      aria-label={`${data.label}: ${data.value}${data.unit ?? ' vehicles'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Shimmer overlay */}
      <div className="card-shimmer" aria-hidden="true" />

      {/* Top row: icon + sparkline */}
      <div className="stat-card__top-row">
        <div className="stat-card__icon-wrap" aria-hidden="true">{data.icon}</div>
        <div className="stat-card__sparkline-svg" aria-hidden="true">
          <SparklinePath heights={sparkHeights} color={color} />
        </div>
      </div>

      <div className="stat-card__body">
        <p className="stat-card__label">{data.label}</p>
        <p className="stat-card__value" style={{ color }}>
          {animatedValue.toLocaleString()}{data.unit ?? ''}
        </p>
        <p className={`stat-card__trend ${trendClass}`}>
          <span aria-hidden="true">{data.trendIcon}</span>
          <span>{data.trend}</span>
        </p>
      </div>

      {/* Decorative bar sparkline – retained for CSS theming */}
      <div className="stat-card__sparkline" aria-hidden="true">
        {sparkHeights.map((h, i) => (
          <div key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
        ))}
      </div>
    </motion.article>
  );
});
StatCard.displayName = 'StatCard';

// ── Main Component ─────────────────────────────────────────────────────────────

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  const resolvedStats: FleetStats = stats ?? {
    total: 0,
    moving: 0,
    stopped: 0,
    offline: 0,
  };

  const cards = [
    ...buildCards(resolvedStats),
    ...EXTENDED_CARDS,
  ];

  return (
    <section aria-label="Fleet statistics overview">
      <div className="stats-grid">
        {cards.map((card, i) => (
          <StatCard key={card.id} data={card} index={i} />
        ))}
      </div>
    </section>
  );
};

  

export default DashboardCards;
