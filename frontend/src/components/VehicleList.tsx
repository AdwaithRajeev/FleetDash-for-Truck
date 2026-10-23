/**
 * VehicleList.tsx
 * Responsive vehicle telemetry table – 8-column enterprise view.
 * Week 1 – Static dummy data only. Ready for Socket.io live updates in Week 3.
 *
 * Columns: Vehicle ID | Driver Name | Vehicle Type | Status |
 *           Speed | Latitude | Longitude | Last Updated
 */

import React, { useMemo, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type VehicleStatus = 'Moving' | 'Stopped' | 'Offline' | 'Idle';

export interface Vehicle {
  vehicleId: string;
  driverName: string;
  driverInitials: string;
  driverAvatarColor: string;
  vehicleType: string;
  vehicleTypeIcon: string;
  status: VehicleStatus;
  speedKmh: number | null;   // null when Offline
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

interface VehicleListProps {
  /** Vehicle records – defaults to dummy data when undefined (Week 1) */
  vehicles?: Vehicle[];
}



// ── Dummy Data (Week 1) ────────────────────────────────────────────────────────



// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatusClass(status: VehicleStatus): string {
  const map: Record<VehicleStatus, string> = {
    Moving:  'status-badge--moving',
    Stopped: 'status-badge--stopped',
    Offline: 'status-badge--offline',
    Idle:    'status-badge--idle',
  };
  return map[status];
}

function getStatusEmoji(status: VehicleStatus): string {
  const map: Record<VehicleStatus, string> = {
    Moving:  '🟢',
    Stopped: '🟡',
    Offline: '🔴',
    Idle:    '⚪',
  };
  return map[status];
}

function formatSpeed(speedKmh: number | null): React.ReactNode {
  if (speedKmh === null) {
    return <span className="speed-na" aria-label="Speed unavailable">—</span>;
  }
  return (
    <div className="speed-cell">
      <span className="speed-value">{speedKmh}</span>
      <span className="speed-unit">km/h</span>
    </div>
  );
}

function formatCoord(value: number): string {
  return value.toFixed(4);
}

// ── Component ──────────────────────────────────────────────────────────────────
const VehicleList: React.FC<VehicleListProps> = ({ vehicles }) => {
  const [filterStatus, setFilterStatus] =
    useState<VehicleStatus | 'All'>('All');

  const filteredVehicles: Vehicle[] = useMemo(() => {
  const sourceVehicles = vehicles ?? [];

  if (filterStatus === 'All') {
    return sourceVehicles;
  }

  return sourceVehicles.filter(
    (vehicle) => vehicle.status === filterStatus
  );
}, [vehicles, filterStatus]);

const sourceVehicles: Vehicle[] = vehicles ?? [];

  const filterOptions: Array<VehicleStatus | 'All'> = [
    'All',
    'Moving',
    'Stopped',
    'Offline',
    'Idle',
  ];

 

  


  return (
    <section
  aria-label="Vehicle list"
  className="vehicle-list-card"
>
      {/* ── Card Header ──────────────────────────────────────────── */}
      <div className="vehicle-list-card__header">
        <div className="vehicle-list-card__title">
          <span aria-hidden="true">🚚</span>
          Vehicle Fleet
          <span className="vehicle-list-card__count">
            {filteredVehicles.length} / {sourceVehicles.length}
          </span>
        </div>

        {/* Status Filter Pills */}
        <div className="map-card__controls" role="group" aria-label="Filter by vehicle status">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              id={`vehicle-filter-${opt.toLowerCase()}`}
              className={`map-btn${filterStatus === opt ? ' active' : ''}`}
              type="button"
              onClick={() => setFilterStatus(opt)}
              aria-pressed={filterStatus === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="vehicle-table-wrap">
        <table
          className="vehicle-table"
          aria-label="Fleet vehicles"
          aria-rowcount={filteredVehicles.length}
        >
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Vehicle ID</th>
              <th scope="col">Driver Name</th>
              <th scope="col">Vehicle Type</th>
              <th scope="col">Status</th>
              <th scope="col">Speed</th>
              <th scope="col">Latitude</th>
              <th scope="col">Longitude</th>
              <th scope="col">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle, index) => (
              <tr
                key={vehicle.vehicleId}
                aria-rowindex={index + 1}
                className={index % 2 === 0 ? 'row-even' : 'row-odd'}
              >
                {/* Row Number */}
                <td>
                  <span className="row-index">{index + 1}</span>
                </td>

                {/* Vehicle ID */}
                <td>
                  <div className="vehicle-id">
                    <div className="vehicle-id__icon" aria-hidden="true">
                      {vehicle.vehicleTypeIcon}
                    </div>
                    <span className="vehicle-id__text">{vehicle.vehicleId}</span>
                  </div>
                </td>

                {/* Driver Name */}
                <td>
                  <div className="driver-info">
                    <div
                      className="driver-avatar"
                      style={{ background: vehicle.driverAvatarColor }}
                      aria-hidden="true"
                    >
                      {vehicle.driverInitials}
                    </div>
                    <span>{vehicle.driverName}</span>
                  </div>
                </td>

                {/* Vehicle Type */}
                <td>
                  <span className="vehicle-type-chip">
                    <span aria-hidden="true">{vehicle.vehicleTypeIcon}</span>
                    {vehicle.vehicleType}
                  </span>
                </td>

                {/* Status Badge */}
                <td>
                  <span
                    className={`status-badge ${getStatusClass(vehicle.status)}`}
                    aria-label={`Status: ${vehicle.status}`}
                  >
                    <span aria-hidden="true">{getStatusEmoji(vehicle.status)}</span>
                    {vehicle.status}
                  </span>
                </td>

                {/* Speed */}
                <td>{formatSpeed(vehicle.speedKmh)}</td>

                {/* Latitude */}
                <td>
                  <span className="coord-cell" title={`Latitude: ${vehicle.latitude}`}>
                    {formatCoord(vehicle.latitude)}
                  </span>
                </td>

                {/* Longitude */}
                <td>
                  <span className="coord-cell" title={`Longitude: ${vehicle.longitude}`}>
                    {formatCoord(vehicle.longitude)}
                  </span>
                </td>

                {/* Last Updated */}
                <td>
                  <span className="last-updated">{vehicle.lastUpdated}</span>
                </td>
              </tr>
            ))}

            {filteredVehicles.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}
                >
                  No vehicles match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Card Footer ──────────────────────────────────────────── */}
      <div className="vehicle-list-card__footer">
        <span className="footer-info">
          Showing {filteredVehicles.length} of {sourceVehicles.length} vehicles
          {/* TODO Week 3: replace with live count from Socket.io */}
        </span>
        <button id="vehicle-view-all-btn" className="footer-link" type="button">
          View all vehicles →
        </button>
      </div>
    </section>
  );
};

export default VehicleList;
