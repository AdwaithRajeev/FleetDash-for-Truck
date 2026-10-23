import React, { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layout/DashboardLayout';
import type { NavId } from './components/Sidebar';
import './styles/dashboard.css';
import VehicleList from './components/VehicleList';
import './styles/dashboard.css';
import MapPlaceholder from './components/MapPlaceholder';
import Register from './pages/Register';



const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
  !!localStorage.getItem('token')
);
const [showRegister, setShowRegister] = useState(false);

  const [activePage, setActivePage] =
    useState<NavId>('dashboard');
const [searchQuery, setSearchQuery] = useState<string>('');
const [vehicles, setVehicles] = useState<any[]>([]);

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loginError, setLoginError] = useState('');
const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
  fetch('http://localhost:5050/vehicles')
    .then((res) => res.json())
    .then((result) => {
      setVehicles(result.data || []);
    })
    .catch((error) => {
      console.error('Failed to fetch vehicles:', error);
    });
}, []);

  const handleNavigate = (page: NavId) => {
    setActivePage(page);
  };
 const handleLogout = () => {
  localStorage.removeItem('token');
  setIsLoggedIn(false);
};

if (!isLoggedIn && showRegister) {
  return (
    <Register
      onRegisterSuccess={() => {
        setShowRegister(false);
      }}
      onLogin={() => {
        setShowRegister(false);
      }}
    />
  );
}
    
if (!isLoggedIn) {
  return (
<div
  style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07111f',
    color: 'white',
  }}
>
  <div
    style={{
      width: '380px',
      padding: '40px',
      borderRadius: '16px',
      background: '#0d1b2a',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    }}
  >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px' }}>🚚</div>

          <h1 style={{ margin: '10px 0' }}>
            FleetDash
          </h1>

          <p style={{ opacity: 0.7 }}>
            Fleet Management Dashboard
          </p>
        </div>

       <form
  onSubmit={async (e) => {
    e.preventDefault();

    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5050/api/users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', result.token);

      localStorage.setItem(
        'user',
        JSON.stringify(result.user)
      );

      setIsLoggedIn(true);

    } catch (error) {
      setLoginError(
        'Unable to connect to server'
      );
    } finally {
      setIsLoading(false);
    }
  }}
>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Email
          </label>

<input
  type="email"
  placeholder="Enter your email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#111f30',
    color: 'white',
    boxSizing: 'border-box',
  }}
/>

          <label
            style={{
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '25px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#111f30',
              color: 'white',
              boxSizing: 'border-box',
            }}
          />

{loginError && (
  <p
    style={{
      color: '#ff6b6b',
      marginBottom: '15px',
      textAlign: 'center',
    }}
  >
    {loginError}
  </p>
)}
<button
  type="submit"
  style={{
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '8px',
    background: '#4f8cff',
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  }}
>
  {isLoading ? 'Signing in...' : 'Login'}
</button>

<p
  style={{
    textAlign: 'center',
    marginTop: '20px',
  }}
>
  Don't have an account?{' '}

  <button
    type="button"
    onClick={() => setShowRegister(true)}
    style={{
      background: 'none',
      border: 'none',
      color: '#4f8cff',
      cursor: 'pointer',
    }}
  >
    Register
  </button>
</p>
        </form>
      </div>
</div>
  );
}

 if (activePage === 'dashboard') {
  return (
    <Dashboard
      activePage={activePage}
      onNavigate={handleNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onLogout={handleLogout}
    />
  );
 }

  const pages = {
    'live-map': {
      title: 'Live Map',
      subtitle: 'Real-time vehicle positions & route tracking',
      icon: '🗺️',
      description:
        'Live vehicle locations and route tracking.',
    },

    vehicles: {
      title: 'Vehicles',
      subtitle: 'Fleet vehicles and driver information',
      icon: '🚛',
      description:
        'Vehicle details, drivers and current status.',
    },

   alerts: {
  title: 'Alerts',
  subtitle: 'Fleet incidents and notifications',
  icon: '🔔',
  description:
    'Fleet alerts and recent incidents received from Socket.io.',
},

    reports: {
      title: 'Reports',
      subtitle: 'Fleet performance reports',
      icon: '📊',
      description:
        'Fleet performance and analytics reports.',
    },

    settings: {
      title: 'Settings',
      subtitle: 'FleetDash configuration',
      icon: '⚙️',
      description:
        'Application and fleet settings.',
    },
  };

  const page = pages[activePage];

  return (
  <DashboardLayout
  pageTitle={page.title}
  pageSubtitle={page.subtitle}
  activePage={activePage}
  onNavigate={handleNavigate}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onLogout={handleLogout}
>
{activePage === 'vehicles' ? (
    <VehicleList
    vehicles={vehicles.map((v) => ({
      vehicleId: v.vehicleId,
      driverName: v.driverName,
      driverInitials: v.driverName
        ? v.driverName.substring(0, 2).toUpperCase()
        : 'NA',
      driverAvatarColor: '#4f8cff',
      vehicleType: 'Truck',
      vehicleTypeIcon: '🚚',
      status: v.status === 'Active' ? 'Moving' : 'Offline',
      speedKmh: v.speed ?? null,
      latitude: v.latitude,
      longitude: v.longitude,
      lastUpdated: new Date(v.updatedAt).toLocaleString(),
    }))}
  />
  ) : activePage === 'live-map' ? (
    <MapPlaceholder vehicles={vehicles} />
  ) : activePage === 'alerts' ? (
    <div style={{ padding: '30px' }}>

      <h2 style={{ marginBottom: '8px' }}>
        Fleet Alerts
      </h2>

      <p style={{ opacity: 0.7, marginBottom: '25px' }}>
        Fleet alerts and recent incidents.
      </p>

      <div style={{ display: 'grid', gap: '15px' }}>

        <div className="card">
          🚨 <strong>Vehicle Offline</strong>
          <p>Vehicle V001 requires attention.</p>
        </div>

        <div className="card">
          ⚠️ <strong>Speed Limit Exceeded</strong>
          <p>Vehicle V001 exceeded the configured speed limit.</p>
        </div>

        <div className="card">
          🟢 <strong>Fleet Connected</strong>
          <p>Fleet monitoring is connected successfully.</p>
        </div>

        <div className="card">
          🔔 <strong>Real-time Monitoring</strong>
          <p>Alerts are monitored through Socket.io.</p>
        </div>

      </div>
    </div>
  ) : (
    <div
      style={{
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>
        {page.icon}
      </div>

        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>
          {page.title}
        </h1>

        <p style={{ fontSize: '16px', opacity: 0.7 }}>
          {page.description}
        </p>
      </div>
    )}
      </DashboardLayout>
    );
  };
  export default App;