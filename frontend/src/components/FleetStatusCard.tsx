/**
 * FleetStatusCard.tsx
 * Live fleet status breakdown.
 *
 * Receives live stats from Dashboard.tsx.
 * Displays:
 * - Moving
 * - Stopped
 * - Offline
 * - Total
 * - Donut chart
 * - Progress bars
 */

import React from 'react';
import { type FleetStats } from './DashboardCards';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FleetStatusCardProps {
  stats?: FleetStats;
}

interface StatusSegment {
  label: string;
  value: number;
  color: string;
  barClass: string;
}

// ── Donut Chart ────────────────────────────────────────────────────────────────

interface DonutChartProps {
  segments: Array<{
    value: number;
    color: string;
    label: string;
  }>;
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  total,
}) => {
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const size = 140;

  let cumulativePercent = 0;

  const safeTotal = total > 0 ? total : 1;

  const paths = segments
    .filter((segment) => segment.value > 0)
    .map((seg, i) => {
      const percent = seg.value / safeTotal;

      const startDeg =
        cumulativePercent * 360 - 90;

      cumulativePercent += percent;

      const endDeg =
        cumulativePercent * 360 - 90;

      const toRad = (deg: number) =>
        (deg * Math.PI) / 180;

      const x1 =
        cx +
        radius *
          Math.cos(toRad(startDeg));

      const y1 =
        cy +
        radius *
          Math.sin(toRad(startDeg));

      const x2 =
        cx +
        radius *
          Math.cos(toRad(endDeg));

      const y2 =
        cy +
        radius *
          Math.sin(toRad(endDeg));

      const largeArc =
        percent > 0.5 ? 1 : 0;

      return (
        <path
          key={`${seg.label}-${i}`}
          d={`
            M ${cx} ${cy}
            L ${x1} ${y1}
            A ${radius} ${radius}
            0 ${largeArc} 1 ${x2} ${y2}
            Z
          `}
          fill={seg.color}
          opacity={0.85}
          aria-label={`${seg.label}: ${seg.value}`}
        />
      );
    });

  return (
    <div
      className="donut-chart-wrap"
      aria-label="Fleet status donut chart"
      role="img"
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
      >
        {/* Background ring */}

        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="var(--color-bg-card-hover)"
        />

        {/* Live segments */}

        {paths}

        {/* Empty state */}

        {total === 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="var(--color-bg-card-hover)"
            opacity={0.5}
          />
        )}

        {/* Centre hole */}

        <circle
          cx={cx}
          cy={cy}
          r={38}
          fill="var(--color-bg-card)"
        />

        {/* Total */}

        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize="20"
          fontWeight="800"
        >
          {total}
        </text>

        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="9"
          fontWeight="600"
          letterSpacing="0.5"
        >
          TOTAL
        </text>
      </svg>
    </div>
  );
};

// ── Progress Bar ───────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{
  segment: StatusSegment;
  total: number;
}> = ({
  segment,
  total,
}) => {
  const pct =
    total > 0
      ? Math.round(
          (segment.value / total) * 100
        )
      : 0;

  return (
    <div className="fleet-status-row">

      <div className="fleet-status-row__label">

        <span
          className={`fleet-status-dot fleet-status-dot--${segment.barClass}`}
          aria-hidden="true"
        />

        <span className="fleet-status-row__name">
          {segment.label}
        </span>

        <span className="fleet-status-row__count">
          {segment.value}
        </span>

      </div>

      <div
        className="fleet-status-bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${segment.label}: ${pct}%`}
      >
        <div
          className={`fleet-status-bar__fill fleet-status-bar--${segment.barClass}`}
          style={{
            width: `${pct}%`,
          }}
        />
      </div>

      <span className="fleet-status-row__pct">
        {pct}%
      </span>

    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const FleetStatusCard: React.FC<
  FleetStatusCardProps
> = ({ stats }) => {

  const resolved: FleetStats =
    stats ?? {
      total: 0,
      moving: 0,
      stopped: 0,
      offline: 0,
    };

  const segments: StatusSegment[] = [
    {
      label: 'Moving',
      value: resolved.moving,
      color: '#22c55e',
      barClass: 'moving',
    },

    {
      label: 'Stopped',
      value: resolved.stopped,
      color: '#f59e0b',
      barClass: 'stopped',
    },

    {
      label: 'Offline',
      value: resolved.offline,
      color: '#ef4444',
      barClass: 'offline',
    },
  ];

  const donutSegments =
    segments.map((segment) => ({
      value: segment.value,
      color: segment.color,
      label: segment.label,
    }));

  return (
    <section
      aria-label="Fleet status breakdown"
      className="fleet-status-card"
    >

      {/* Header */}

      <div className="fleet-status-card__header">

        <div className="fleet-status-card__title">

          <span aria-hidden="true">
            📊
          </span>

          Fleet Status

        </div>

        <span className="fleet-status-card__subtitle">
          Live breakdown
        </span>

      </div>

      {/* Body */}

      <div className="fleet-status-card__body">

        {/* Donut */}

        <DonutChart
          segments={donutSegments}
          total={resolved.total}
        />

        {/* Status bars */}

        <div className="fleet-status-bars">

          {segments.map((segment) => (
            <ProgressBar
              key={segment.label}
              segment={segment}
              total={resolved.total}
            />
          ))}

        </div>

      </div>

    </section>
  );
};

export default FleetStatusCard;