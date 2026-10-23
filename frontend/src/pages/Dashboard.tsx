import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";
import { motion } from 'framer-motion';

import type { FleetAlert } from '../components/RecentAlerts';
import { getVehicles } from '../services/api';
import type { Vehicle } from '../components/VehicleList';

import type { NavId } from '../components/Sidebar';
import DashboardLayout from '../layout/DashboardLayout';

import DashboardCards, {
  type FleetStats,
} from '../components/DashboardCards';
import MapPlaceholder from '../components/MapPlaceholder';
import VehicleList from '../components/VehicleList';
import RecentAlerts from '../components/RecentAlerts';
import FleetStatusCard from '../components/FleetStatusCard';
import Footer from '../components/Footer';

import { socket } from '../services/socket';

const FleetAnalytics = lazy(
  () => import('../components/FleetAnalytics')
);

const AnalyticsSkeleton: React.FC = () => (
  <div
    className="analytics-section"
    aria-busy="true"
    aria-label="Loading analytics"
  >
    <div className="skeleton-header">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-badge" />
    </div>

    <div className="analytics-grid">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`analytics-card${
            i === 0 ? ' analytics-card--wide' : ''
          } skeleton-card`}
        >
          <div className="skeleton skeleton-card-title" />
          <div className="skeleton skeleton-chart" />
        </div>
      ))}
    </div>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageVariants: Record<string, any> = {
  initial: {
    opacity: 0,
  },

  enter: {
    opacity: 1,
    transition: {
      duration: 0.45,
    },
  },
};

const SectionLabel: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="dashboard-section-label">
    <span
      className="section-label-icon"
      aria-hidden="true"
    >
      {icon}
    </span>

    <div>
      <h2 className="section-label-title">
        {title}
      </h2>

      {subtitle && (
        <p className="section-label-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// BACKEND VEHICLE TYPE
// ─────────────────────────────────────────────────────────────

interface BackendVehicle {
  _id: string;
  vehicleId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: 'Active' | 'Inactive';
  lastUpdated: string;
  __v?: number;
}

// ─────────────────────────────────────────────────────────────
// MAP BACKEND VEHICLE → FRONTEND VEHICLE
// ─────────────────────────────────────────────────────────────

const mapVehicleData = (
  vehicle: BackendVehicle
): Vehicle => {
  const speed = vehicle.speed ?? 0;

  let status: Vehicle['status'];

  if (vehicle.status === 'Inactive') {
    status = 'Offline';
  } else if (speed > 0) {
    status = 'Moving';
  } else {
    status = 'Stopped';
  }

  const initials = vehicle.driverName
    ? vehicle.driverName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'NA';

  return {
    vehicleId: vehicle.vehicleId,
    driverName: vehicle.driverName,
    driverInitials: initials,
    driverAvatarColor: '#6366f1',
    vehicleType: 'Vehicle',
    vehicleTypeIcon: '🚛',
    status,
    speedKmh:
      vehicle.status === 'Inactive'
        ? null
        : speed,
    latitude: vehicle.latitude,
    longitude: vehicle.longitude,
    lastUpdated: vehicle.lastUpdated
      ? new Date(
          vehicle.lastUpdated
        ).toLocaleString()
      : 'Unknown',
  };
};

// ─────────────────────────────────────────────────────────────
// CALCULATE STATS
// ─────────────────────────────────────────────────────────────

const calculateStats = (
  vehicles: Vehicle[]
): FleetStats => ({
  total: vehicles.length,

  moving: vehicles.filter(
    (vehicle) =>
      vehicle.status === 'Moving'
  ).length,

  stopped: vehicles.filter(
    (vehicle) =>
      vehicle.status === 'Stopped'
  ).length,

  offline: vehicles.filter(
    (vehicle) =>
      vehicle.status === 'Offline'
  ).length,
});

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

interface DashboardProps {
  activePage?: NavId;
  onNavigate?: (id: NavId) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  activePage = 'dashboard',
  onNavigate = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  onLogout = () => {},
}) => {
  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);


  const [alerts, setAlerts] =
    useState<FleetAlert[]>([]);

  const [stats, setStats] =
    useState<FleetStats>({
      total: 0,
      moving: 0,
      stopped: 0,
      offline: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // IMPORTANT:
  // MapPlaceholder owns the actual canvas.
  // Dashboard only passes this ref to it.
  

  // ─────────────────────────────────────────────────────────────
  // REST API
  // ─────────────────────────────────────────────────────────────

// REST API

const fetchVehicles = async (): Promise<void> => {
  try {
    setLoading(true);
    setError(null);

    const result = await getVehicles();

    console.log(
      'Dashboard backend response:',
      result
    );

    const formattedVehicles =
      result.map(mapVehicleData);

    setVehicles(formattedVehicles);

    setStats(
      calculateStats(formattedVehicles)
    );

    console.log(
      'Dashboard vehicles:',
      formattedVehicles
    );
  } catch (err) {
    console.error(
      'Failed to fetch vehicles:',
      err
    );

    setError('Unable to load vehicles');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchVehicles();
}, []);

  // ─────────────────────────────────────────────────────────────
  // SOCKET CONNECTION
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleConnect = () => {
      console.log(
        'Dashboard socket connected:',
        socket.id
      );
    };

    socket.on(
      'connect',
      handleConnect
    );

    return () => {
      socket.off(
        'connect',
        handleConnect
      );
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // INITIAL VEHICLES
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleInitialVehicles = (
      backendVehicles: BackendVehicle[]
    ) => {
      console.log(
        'Vehicles received through Socket.io:',
        backendVehicles
      );

      const formattedVehicles =
        backendVehicles.map(
          mapVehicleData
        );

      setVehicles(
        formattedVehicles
      );

      setStats(
        calculateStats(
          formattedVehicles
        )
      );
    };

    socket.on(
      'vehicles:init',
      handleInitialVehicles
    );

    return () => {
      socket.off(
        'vehicles:init',
        handleInitialVehicles
      );
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // FULL VEHICLE UPDATE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleVehicleUpdate = (
      backendVehicles: BackendVehicle[]
    ) => {
      console.log(
        'Vehicles received through Socket.io update:',
        backendVehicles
      );

      const formattedVehicles =
        backendVehicles.map(
          mapVehicleData
        );

      setVehicles(
        formattedVehicles
      );

      setStats(
        calculateStats(
          formattedVehicles
        )
      );
    };

    socket.on(
      'vehicles:update',
      handleVehicleUpdate
    );

    return () => {
      socket.off(
        'vehicles:update',
        handleVehicleUpdate
      );
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // SINGLE VEHICLE UPDATE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleSingleVehicleUpdate = (
      backendVehicle: BackendVehicle
    ) => {
      console.log(
        'Single vehicle update:',
        backendVehicle
      );

      const updatedVehicle =
        mapVehicleData(
          backendVehicle
        );

      setVehicles(
        (currentVehicles) => {
          const exists =
            currentVehicles.some(
              (vehicle) =>
                vehicle.vehicleId ===
                updatedVehicle.vehicleId
            );

          let updatedVehicles: Vehicle[];

          if (exists) {
            updatedVehicles =
              currentVehicles.map(
                (vehicle) =>
                  vehicle.vehicleId ===
                  updatedVehicle.vehicleId
                    ? updatedVehicle
                    : vehicle
              );
          } else {
            updatedVehicles = [
              ...currentVehicles,
              updatedVehicle,
            ];
          }

          setStats(
            calculateStats(
              updatedVehicles
            )
          );

          return updatedVehicles;
        }
      );
    };

    socket.on(
      'vehicle:update',
      handleSingleVehicleUpdate
    );

    return () => {
      socket.off(
        'vehicle:update',
        handleSingleVehicleUpdate
      );
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // INITIAL ALERTS
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleInitialAlerts = (
      backendAlerts: FleetAlert[]
    ) => {
      console.log(
        'Alerts received through Socket.io:',
        backendAlerts
      );

      setAlerts(
        backendAlerts
      );
    };

    socket.on(
      'alerts:init',
      handleInitialAlerts
    );

    return () => {
      socket.off(
        'alerts:init',
        handleInitialAlerts
      );
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // NEW LIVE ALERT
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleNewAlert = (
      alert: FleetAlert
    ) => {
      console.log(
        'New alert received:',
        alert
      );

      setAlerts(
        (currentAlerts) => [
          alert,
          ...currentAlerts,
        ].slice(0, 20)
      );
    };

    socket.on(
      'alert:new',
      handleNewAlert
    );

    return () => {
      socket.off(
        'alert:new',
        handleNewAlert
      );
    };  
  }, []);

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
  <DashboardLayout
  pageTitle="Fleet Dashboard"
  pageSubtitle="Real-time fleet monitoring & analytics"
  activePage={activePage}
  onNavigate={onNavigate}
  searchQuery={searchQuery}
  onSearchChange={onSearchChange}
  onLogout={onLogout}
  onRefresh={fetchVehicles}
  alertCount={alerts.length}
  
>
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
          }}
        >
          Loading fleet data...
        </div>
      </DashboardLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────────────────────

  if (error) {
    return (
  <DashboardLayout
  pageTitle="Fleet Dashboard"
  pageSubtitle="Real-time fleet monitoring & analytics"
  activePage={activePage}
  onNavigate={onNavigate}
  searchQuery={searchQuery}
  onSearchChange={onSearchChange}
  onLogout={onLogout}
>
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#ff5c5c',
          }}
        >
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
  <DashboardLayout
  pageTitle="Fleet Dashboard"
  pageSubtitle="Real-time fleet monitoring & analytics"
  activePage={activePage}
  onNavigate={onNavigate}
  searchQuery={searchQuery}
  onSearchChange={onSearchChange}
  onLogout={onLogout}
>
      <motion.div
        className="dashboard-page"
        variants={pageVariants}
        initial="initial"
        animate="enter"
      >
        {/* Fleet Overview */}

        <SectionLabel
          icon="📊"
          title="Fleet Overview"
          subtitle="Live key performance indicators"
        />

        <DashboardCards
          stats={stats}
        />

        {/* Live Map */}

        <SectionLabel
          icon="🗺"
          title="Live Map"
          subtitle="Real-time vehicle positions & route tracking"
        />

        <MapPlaceholder
  height={520}
  vehicles={vehicles}
/>

        {/* Status & Alerts */}

        <SectionLabel
          icon="🚦"
          title="Status & Alerts"
          subtitle="Fleet health and recent incident feed"
        />

        <div className="dashboard-two-col">
          <FleetStatusCard
            stats={stats}
          />

          <RecentAlerts
            alerts={alerts}
          />
        </div>

        {/* Vehicle Fleet */}

        <SectionLabel
          icon="🚛"
          title="Vehicle Fleet"
          subtitle="Detailed view of all vehicles and driver status"
        />

        <VehicleList
  vehicles={vehicles.filter((vehicle) =>
    vehicle.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  )}
/>

        {/* Analytics */}

        <Suspense
          fallback={
            <AnalyticsSkeleton />
          }
        >
          <FleetAnalytics
            vehicles={vehicles}
          />
        </Suspense>

        <Footer />
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;