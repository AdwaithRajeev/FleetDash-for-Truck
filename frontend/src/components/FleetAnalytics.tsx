/**
 * FleetAnalytics.tsx
 * Fleet analytics dashboard section with pure SVG charts.
 * Week 1 – Static dummy data only.
 *
 * Charts: Speed Trend (area), Fleet Utilization (donut),
 *         Trip Statistics (bar), Vehicle Distribution (horizontal bar),
 *         Alerts Overview (bar).
 *
 * All animations powered by Framer Motion.
 * No external charting library – pure SVG for max performance.
 */

import React, { memo, useEffect, useRef } from 'react';
import type { Vehicle } from './VehicleList';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

interface FleetAnalyticsProps {
  vehicles: Vehicle[];
}

// ── Animation Variants ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cardVariants: Record<string, any> = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const staggerContainer: Record<string, any> = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
};



// Trips per day for last 7 days
const TRIP_DATA = [
  { day: 'Mon', count: 38 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 45 },
  { day: 'Thu', count: 61 },
  { day: 'Fri', count: 55 },
  { day: 'Sat', count: 29 },
  { day: 'Sun', count: 18 },
];

// Vehicle type distribution
const VEHICLE_DIST = [
  { type: 'Trucks',     count: 18, color: '#4F8CFF' },
  { type: 'Vans',       count: 10, color: '#00D4FF' },
  { type: 'Trailers',   count:  8, color: '#31D67B' },
  { type: 'Mini Trucks', count:  6, color: '#FFB547' },
];

// Alerts by severity
const ALERT_DATA = [
  { label: 'Critical', count: 2,  color: '#FF5C5C' },
  { label: 'Warning',  count: 5,  color: '#FFB547' },
  { label: 'Info',     count: 8,  color: '#4F8CFF' },
];

// ── Animated Number ────────────────────────────────────────────────────────────

const AnimatedNumber: React.FC<{ value: number; suffix?: string }> = memo(({ value, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 90, damping: 18 });
  const isInView   = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, value, motionVal]);

  useEffect(() => {
    return springVal.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
  }, [springVal, suffix]);

  return <span ref={ref}>0{suffix}</span>;
});
AnimatedNumber.displayName = 'AnimatedNumber';

// ── SVG Area Chart — Speed Trend ───────────────────────────────────────────────

const SpeedTrendChart: React.FC<{ vehicles: Vehicle[] }> = memo(({ vehicles }) => {
  const speeds = vehicles
    .map((vehicle) => vehicle.speedKmh)
    .filter((speed): speed is number => speed !== null);

  if (speeds.length === 0) {
    return (
      <div className="analytics-empty">
        No speed data available
      </div>
    );
  }

  const W = 340;
  const H = 130;
  const PAD = 12;

  const max = Math.max(...speeds, 10);
  const min = 0;
  const stepX =
    speeds.length > 1
      ? (W - PAD * 2) / (speeds.length - 1)
      : 0;

  const pts = speeds.map((speed, i) => ({
    x: PAD + i * stepX,
    y:
      PAD +
      ((max - speed) / (max - min || 1)) *
        (H - PAD * 2),
  }));

  const linePath = pts
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    )
    .join(' ');

  const areaPath =
    pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`
      : '';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="analytics-svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="speedFill"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#4F8CFF"
            stopOpacity="0.35"
          />
          <stop
            offset="100%"
            stopColor="#4F8CFF"
            stopOpacity="0.02"
          />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((f, i) => (
        <line
          key={i}
          x1={PAD}
          y1={PAD + f * (H - PAD * 2)}
          x2={W - PAD}
          y2={PAD + f * (H - PAD * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}

      <motion.path
        d={areaPath}
        fill="url(#speedFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.path
        d={linePath}
        fill="none"
        stroke="#4F8CFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#4F8CFF"
          stroke="rgba(8,17,32,0.9)"
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      ))}

      {vehicles.map((vehicle, i) => (
        <text
          key={vehicle.vehicleId}
          x={PAD + i * stepX}
          y={H - 1}
          textAnchor="middle"
          fill="rgba(141,162,192,0.6)"
          fontSize="7.5"
        >
          {vehicle.vehicleId}
        </text>
      ))}
    </svg>
  );
});

SpeedTrendChart.displayName = 'SpeedTrendChart';

// ── SVG Donut — Fleet Utilization ──────────────────────────────────────────────

const FleetUtilizationDonut: React.FC<{ vehicles: Vehicle[] }> = memo(
  ({ vehicles }) => {
    const utilized =
      vehicles.length > 0
        ? Math.round(
            (vehicles.filter(
              (vehicle) =>
                vehicle.status === 'Moving'
            ).length /
              vehicles.length) *
              100
          )
        : 0;
  const R = 52, CX = 70, CY = 70, SW = 12;
  const circ = 2 * Math.PI * R;
  const dashFill = (circ * utilized) / 100;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 140 140" width={140} height={140} aria-hidden="true">
        <defs>
          <linearGradient id="utilGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#4F8CFF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={SW}
        />
        {/* Utilized arc */}
        <motion.circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke="url(#utilGrad)" strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dashFill }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ transformOrigin: `${CX}px ${CY}px`, transform: 'rotate(-90deg)' }}
        />
        {/* Center text */}
        <text x={CX} y={CY - 6} textAnchor="middle"
          fill="#FFFFFF" fontSize="22" fontWeight="800"
          fontFamily="Space Grotesk, Inter, sans-serif"
        >
          {utilized}%
        </text>
        <text x={CX} y={CY + 11} textAnchor="middle"
          fill="rgba(141,162,192,0.7)" fontSize="8.5" fontWeight="600"
          fontFamily="Inter, sans-serif" letterSpacing="0.8"
        >
          UTILIZED
        </text>
      </svg>
    </div>
  );
});
FleetUtilizationDonut.displayName = 'FleetUtilizationDonut';

// ── SVG Bar Chart — Trip Statistics ───────────────────────────────────────────

const TripBarChart: React.FC = memo(() => {
  const W = 280, H = 120, PAD = 14;
  const maxCount = Math.max(...TRIP_DATA.map(d => d.count));
  const barW = (W - PAD * 2) / TRIP_DATA.length - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="analytics-svg" aria-hidden="true">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4F8CFF" />
          <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.33, 0.66, 1].map((f, i) => (
        <line key={i}
          x1={PAD} y1={PAD + f * (H - PAD * 2 - 16)}
          x2={W - PAD} y2={PAD + f * (H - PAD * 2 - 16)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1"
        />
      ))}

      {TRIP_DATA.map((d, i) => {
        const barH = ((d.count / maxCount) * (H - PAD * 2 - 20));
        const x    = PAD + i * ((W - PAD * 2) / TRIP_DATA.length) + 3;
        const y    = H - PAD - 16 - barH;

        return (
          <g key={d.day}>
            <motion.rect
              x={x} y={y} width={barW} rx={3}
              fill={d.day === 'Thu' ? '#4F8CFF' : 'rgba(79,140,255,0.35)'}
              initial={{ height: 0, y: H - PAD - 16 }}
              animate={{ height: barH, y }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            <text x={x + barW / 2} y={H - 4}
              textAnchor="middle" fill="rgba(141,162,192,0.65)"
              fontSize="7.5" fontFamily="Inter, sans-serif"
            >{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
});
TripBarChart.displayName = 'TripBarChart';

// ── Vehicle Distribution — Horizontal Bars ────────────────────────────────────

const VehicleDistChart: React.FC = memo(() => {
  const total = VEHICLE_DIST.reduce((s, v) => s + v.count, 0);

  return (
    <div className="vdist-chart">
      {VEHICLE_DIST.map((v, i) => (
        <div key={v.type} className="vdist-row">
          <span className="vdist-label">{v.type}</span>
          <div className="vdist-bar-track">
            <motion.div
              className="vdist-bar-fill"
              style={{ background: v.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(v.count / total) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="vdist-count">{v.count}</span>
        </div>
      ))}
    </div>
  );
});
VehicleDistChart.displayName = 'VehicleDistChart';

// ── Alerts Overview — Vertical bars ───────────────────────────────────────────

const AlertsOverviewChart: React.FC = memo(() => {
  const W = 160, H = 110, PAD = 10;
  const maxCount = Math.max(...ALERT_DATA.map(d => d.count));
  const barW = (W - PAD * 2) / ALERT_DATA.length - 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
      {ALERT_DATA.map((d, i) => {
        const barH = ((d.count / maxCount) * (H - PAD * 2 - 18));
        const x    = PAD + i * ((W - PAD * 2) / ALERT_DATA.length) + 6;
        const y    = H - PAD - 18 - barH;

        return (
          <g key={d.label}>
            <motion.rect
              x={x} y={y} width={barW} rx={4}
              fill={d.color}
              opacity={0.75}
              initial={{ height: 0, y: H - PAD - 18 }}
              animate={{ height: barH, y }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <text x={x + barW / 2} y={H - 6}
              textAnchor="middle" fill="rgba(141,162,192,0.7)"
              fontSize="7" fontFamily="Inter, sans-serif"
            >{d.label}</text>
            <text x={x + barW / 2} y={y - 3}
              textAnchor="middle" fill={d.color}
              fontSize="8.5" fontWeight="700" fontFamily="Space Grotesk, sans-serif"
            >{d.count}</text>
          </g>
        );
      })}
    </svg>
  );
});
AlertsOverviewChart.displayName = 'AlertsOverviewChart';

// ── KPI Mini Stat ──────────────────────────────────────────────────────────────

const AnalyticsMiniStat: React.FC<{ label: string; value: number; unit: string; color: string }> = memo(
  ({ label, value, unit, color }) => (
    <div className="analytics-mini-stat">
      <p className="analytics-mini-stat__label">{label}</p>
      <p className="analytics-mini-stat__value" style={{ color }}>
        <AnimatedNumber value={value} suffix={unit} />
      </p>
    </div>
  )
);
AnalyticsMiniStat.displayName = 'AnalyticsMiniStat';

// ── Main Component ─────────────────────────────────────────────────────────────

const FleetAnalytics: React.FC<FleetAnalyticsProps> = memo(
  ({ vehicles }) => {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    const speedValues = vehicles
      .map((vehicle) => vehicle.speedKmh)
      .filter((speed): speed is number => speed !== null);

    const averageSpeed =
      speedValues.length > 0
        ? Math.round(
            speedValues.reduce((sum, speed) => sum + speed, 0) /
              speedValues.length
          )
        : 0;

    const peakSpeed =
      speedValues.length > 0
        ? Math.max(...speedValues)
        : 0;

    const movingCount = vehicles.filter(
      (vehicle) => vehicle.status === 'Moving'
    ).length;

    const idleCount = vehicles.filter(
  (vehicle) => vehicle.status === 'Idle'
).length;
  

  return (
    <motion.section
      ref={ref}
      aria-label="Fleet analytics"
      className="analytics-section"
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Section Header */}
      <div className="analytics-section-header">
        <div>
          <h2 className="analytics-section-title">
            <span aria-hidden="true">📈</span> Fleet Analytics
          </h2>
          <p className="analytics-section-subtitle">Performance metrics & operational insights</p>
        </div>
        <div className="analytics-period-badge">Last 7 Days</div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-grid">

        {/* Speed Trend — wide card */}
        <motion.div className="analytics-card analytics-card--wide" variants={cardVariants} id="analytics-speed-trend">
          <div className="analytics-card__header">
            <div className="analytics-card__title">
              <span className="analytics-card__icon" style={{ background: 'rgba(79,140,255,0.15)', color: '#4F8CFF' }}>⚡</span>
              Speed Trend
            </div>
            <div className="analytics-card__meta">
              <AnalyticsMiniStat
  label="Avg Speed"
  value={averageSpeed}
  unit=" km/h"
  color="#4F8CFF"
/>

<AnalyticsMiniStat
  label="Peak"
  value={peakSpeed}
  unit=" km/h"
  color="#00D4FF"
/>
            </div>
          </div>
          <SpeedTrendChart vehicles={vehicles} />
        </motion.div>

        {/* Fleet Utilization — square card */}
        <motion.div className="analytics-card" variants={cardVariants} id="analytics-utilization">
          <div className="analytics-card__header">
            <div className="analytics-card__title">
              <span className="analytics-card__icon" style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>🎯</span>
              Utilization
            </div>
          </div>
          <div className="analytics-card__center">
            <FleetUtilizationDonut vehicles={vehicles} />
          </div>
          <div className="analytics-util-stats">
            <div className="analytics-util-stat">
              <span style={{ color: '#31D67B' }}>●</span> Active
              <strong>{movingCount}</strong>
            </div>
            <div className="analytics-util-stat">
              <span style={{ color: '#8DA2C0' }}>●</span> Idle
              <strong>{idleCount}</strong>
            </div>
          </div>
        </motion.div>

        {/* Trip Statistics */}
        <motion.div className="analytics-card" variants={cardVariants} id="analytics-trips">
          <div className="analytics-card__header">
            <div className="analytics-card__title">
              <span className="analytics-card__icon" style={{ background: 'rgba(49,214,123,0.15)', color: '#31D67B' }}>🗺</span>
              Trips / Day
            </div>
            <div className="analytics-card__badge" style={{ color: '#31D67B', background: 'rgba(49,214,123,0.12)', borderColor: 'rgba(49,214,123,0.25)' }}>
              ↑ 12%
            </div>
          </div>
          <TripBarChart />
          <div className="analytics-trips-total">
            <AnimatedNumber value={298} /> trips this week
          </div>
        </motion.div>

        {/* Vehicle Distribution */}
        <motion.div className="analytics-card" variants={cardVariants} id="analytics-vehicle-dist">
          <div className="analytics-card__header">
            <div className="analytics-card__title">
              <span className="analytics-card__icon" style={{ background: 'rgba(255,181,71,0.15)', color: '#FFB547' }}>🚛</span>
              Fleet Breakdown
            </div>
          </div>
          <VehicleDistChart />
        </motion.div>

        {/* Alerts Overview */}
        <motion.div className="analytics-card" variants={cardVariants} id="analytics-alerts-overview">
          <div className="analytics-card__header">
            <div className="analytics-card__title">
              <span className="analytics-card__icon" style={{ background: 'rgba(255,92,92,0.15)', color: '#FF5C5C' }}>🚨</span>
              Alerts
            </div>
            <div className="analytics-card__badge" style={{ color: '#FF5C5C', background: 'rgba(255,92,92,0.12)', borderColor: 'rgba(255,92,92,0.25)' }}>
              15 total
            </div>
          </div>
          <AlertsOverviewChart />
        </motion.div>

      </div>
    </motion.section>
  );
});

FleetAnalytics.displayName = 'FleetAnalytics';
export default FleetAnalytics;
