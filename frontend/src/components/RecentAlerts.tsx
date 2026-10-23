/**
 * RecentAlerts.tsx
 * Live fleet alerts panel.
 *
 * Alerts can now be supplied through the `alerts` prop.
 * Dashboard.tsx will receive alerts from Socket.io.
 *
 * If no live alerts are received, the existing dummy alerts
 * are displayed as a fallback.
 */

import React, { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

export type AlertSeverity =
  | 'Critical'
  | 'Warning'
  | 'Information';

export interface FleetAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  vehicleId: string;
  timestamp: string;
}

// ── Dummy fallback data ─────────────────────────────────────────────────────────

const DUMMY_ALERTS: FleetAlert[] = [
  {
    id: 'alert-001',
    severity: 'Critical',
    title: 'Engine Overheat',
    description:
      'Engine temperature exceeded safe threshold (112°C).',
    vehicleId: 'FLT-007',
    timestamp: '2 min ago',
  },
  {
    id: 'alert-002',
    severity: 'Critical',
    title: 'GPS Signal Lost',
    description:
      'Unable to locate vehicle for more than 10 minutes.',
    vehicleId: 'FLT-010',
    timestamp: '18 min ago',
  },
  {
    id: 'alert-003',
    severity: 'Warning',
    title: 'Low Fuel Level',
    description:
      'Fuel below 15%. Schedule refuelling at nearest depot.',
    vehicleId: 'FLT-003',
    timestamp: '34 min ago',
  },
  {
    id: 'alert-004',
    severity: 'Warning',
    title: 'Speed Limit Exceeded',
    description:
      'Vehicle exceeded 110 km/h on residential zone road.',
    vehicleId: 'FLT-004',
    timestamp: '1 hr ago',
  },
  {
    id: 'alert-005',
    severity: 'Information',
    title: 'Scheduled Maintenance Due',
    description:
      'Next service is due in 3 days or 450 km.',
    vehicleId: 'FLT-002',
    timestamp: '2 hr ago',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getSeverityClass(
  severity: AlertSeverity
): string {
  const map: Record<AlertSeverity, string> = {
    Critical: 'alert-item--critical',
    Warning: 'alert-item--warning',
    Information: 'alert-item--info',
  };

  return map[severity];
}

function getSeverityIcon(
  severity: AlertSeverity
): string {
  const map: Record<AlertSeverity, string> = {
    Critical: '🔴',
    Warning: '🟡',
    Information: '🔵',
  };

  return map[severity];
}

// ── Filter options ────────────────────────────────────────────────────────────

type FilterType =
  | 'All'
  | AlertSeverity;

const FILTER_OPTIONS: FilterType[] = [
  'All',
  'Critical',
  'Warning',
  'Information',
];

// ── Alert item ────────────────────────────────────────────────────────────────

const AlertItem: React.FC<{
  alert: FleetAlert;
  index: number;
}> = memo(({ alert, index }) => (
  <motion.li
    id={alert.id}
    className={`alert-item ${getSeverityClass(
      alert.severity
    )}`}
    aria-label={`${alert.severity} alert: ${alert.title}`}
    initial={{
      opacity: 0,
      x: 14,
    }}
    animate={{
      opacity: 1,
      x: 0,
    }}
    exit={{
      opacity: 0,
      x: -14,
    }}
    transition={{
      delay: index * 0.07,
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={{
      x: 4,
      backgroundColor:
        'rgba(255,255,255,0.028)',
    }}
    layout
  >
    <span
      className="alert-item__icon"
      aria-hidden="true"
    >
      {getSeverityIcon(alert.severity)}
    </span>

    <div className="alert-item__body">
      <div className="alert-item__top">
        <span className="alert-item__title">
          {alert.title}
        </span>

        <span
          className={`alert-item__badge alert-badge--${alert.severity.toLowerCase()}`}
        >
          {alert.severity}
        </span>
      </div>

      <p className="alert-item__desc">
        {alert.description}
      </p>

      <div className="alert-item__meta">
        <span className="alert-item__vehicle">
          {alert.vehicleId}
        </span>

        <span className="alert-item__time">
          {alert.timestamp}
        </span>
      </div>
    </div>
  </motion.li>
));

AlertItem.displayName = 'AlertItem';

// ── Props ──────────────────────────────────────────────────────────────────────

interface RecentAlertsProps {
  alerts?: FleetAlert[];
}

// ── Main Component ─────────────────────────────────────────────────────────────

const RecentAlerts: React.FC<
  RecentAlertsProps
> = ({ alerts }) => {
  const [activeFilter, setActiveFilter] =
    useState<FilterType>('All');

  /*
   * If Dashboard provides live alerts,
   * use them.
   *
   * Otherwise keep the existing dummy alerts.
   */
  const alertData =
    alerts && alerts.length > 0
      ? alerts
      : DUMMY_ALERTS;

  const filtered = useMemo(() => {
    if (activeFilter === 'All') {
      return alertData;
    }

    return alertData.filter(
      (alert) =>
        alert.severity === activeFilter
    );
  }, [alertData, activeFilter]);

  const criticalCount =
    alertData.filter(
      (alert) =>
        alert.severity === 'Critical'
    ).length;

  return (
    <motion.section
      aria-label="Recent fleet alerts"
      className="alerts-card"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.3,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Card Header */}

      <div className="alerts-card__header">
        <div className="alerts-card__title">
          <span aria-hidden="true">
            🚨
          </span>

          Recent Alerts

          <span
            className="alerts-card__count"
            aria-label={`${criticalCount} critical alerts`}
          >
            {criticalCount} Critical
          </span>
        </div>

        <button
          id="alerts-view-all-btn"
          className="footer-link"
          type="button"
        >
          View all →
        </button>
      </div>

      {/* Filter Tabs */}

      <div
        className="alerts-filter-bar"
        role="group"
        aria-label="Filter alerts by severity"
      >
        {FILTER_OPTIONS.map((opt) => (
          <motion.button
            key={opt}
            className={`alerts-filter-btn${
              activeFilter === opt
                ? ' active'
                : ''
            }`}
            type="button"
            onClick={() =>
              setActiveFilter(opt)
            }
            aria-pressed={
              activeFilter === opt
            }
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.96,
            }}
            transition={{
              duration: 0.12,
            }}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {/* Alert List */}

      <ul
        className="alerts-list"
        aria-label="Fleet alert list"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map(
            (alert, index) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                index={index}
              />
            )
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.li
            className="alerts-empty"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >
            No alerts in this category.
          </motion.li>
        )}
      </ul>
    </motion.section>
  );
};

export default RecentAlerts;