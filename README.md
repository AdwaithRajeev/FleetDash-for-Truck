# FleetDash – High-Throughput Event-Driven Fleet Telemetry Dashboard

## Team Structure
Person 1: Backend Lead (Node.js, Express, worker_threads)

Person 2: Data & Real-Time Lead (MongoDB, Redis, Socket.io)

Person 3: Frontend Lead (React, TypeScript, Canvas API)

Person 4: Geospatial, QA & DevOps Lead (Turf.js, Jest, CI/CD)



## 📋 Overview

FleetDash is a real-time, event-driven fleet telemetry dashboard for monitoring vehicle positions, driver statuses, speed, and operational alerts across an entire fleet. Built with **React 19 + TypeScript + Vite**.

---

## Person 1(Backend Lead)

### Ingestion Engine
- Node.js
- Express
- worker_threads
- Coordinate validation and parsing
- Single and batch coordinate processing

### Database
- MongoDB
- Mongoose
- Vehicle telemetry storage
- bulkWrite() for batch updates
---

> Project 1 · Person 3 (Frontend Engineer) · Week 1: Static Dashboard UI
## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx        # Left navigation sidebar
│   │   ├── Header.tsx         # Top header with search & notifications
│   │   ├── DashboardCards.tsx # Four KPI stat cards
│   │   ├── MapPlaceholder.tsx # Live Map area (Canvas in Week 3)
│   │   └── VehicleList.tsx    # Vehicle telemetry table
│   ├── layout/
│   │   └── DashboardLayout.tsx # Shell layout (Sidebar + Header + main)
│   ├── pages/
│   │   └── Dashboard.tsx      # Main dashboard page
│   ├── assets/                # Static assets
│   ├── styles/
│   │   └── dashboard.css      # Design system + all component styles
│   ├── App.tsx                # Application root
│   └── main.tsx               # Vite entry point
├── index.html                 # HTML shell with SEO meta tags
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🗓 Week-by-Week Roadmap

| Week | Owner | Task |
|------|-------|------|
| **Week 1** ✅ | Person 3 (Frontend) | Static dashboard UI – React + TypeScript |
| **Week 2** | Person 2 (Backend) | Express + Socket.io telemetry emitter |
| **Week 3** | Person 3 (Frontend) | Canvas renderer + Socket.io live feed |
| **Week 4** | All | Integration, testing, optimisation |

---

## 🎨 Design System

- **Theme**: Professional dark (`#0a0d14` base)
- **Font**: Inter (Google Fonts)
- **Colors**: CSS custom properties (`--color-*`)
- **Components**: Fully typed, reusable React functional components
- **Responsive**: Mobile (480px) · Tablet (768px) · Desktop (1024px+)

---

## 🔌 Future Integration Points (Week 3)

### Socket.io
```tsx
// App.tsx – wrap with provider
<FleetSocketProvider url={import.meta.env.VITE_SOCKET_URL}>
  <Dashboard />
</FleetSocketProvider>
```

### Canvas Map Rendering
```tsx
// MapPlaceholder.tsx – #fleet-map-canvas is already in the DOM
const canvasRef = useRef<HTMLCanvasElement>(null);
// 1. Remove opacity: 0 from #fleet-map-canvas in dashboard.css
// 2. Attach socket listener → call renderFrame(ctx, vehiclePositions)
// 3. Use requestAnimationFrame for 60 fps loop
```

---

## ✅ Week 1 Checklist

- [x] React 19 + TypeScript + Vite scaffold
- [x] Professional dark-theme design system (CSS custom properties)
- [x] `Sidebar` – logo, nav items with active state & badge
- [x] `Header` – search, notifications, user avatar
- [x] `DashboardCards` – 4 KPI cards with trend indicators
- [x] `MapPlaceholder` – `#fleet-map-canvas` DOM node ready for Week 3
- [x] `VehicleList` – 10 sample vehicles, status filter pills
- [x] `DashboardLayout` – reusable page shell
- [x] Full responsive layout (mobile/tablet/desktop)
- [x] Zero TypeScript errors (`tsc --noEmit` passes)
- [x] SEO meta tags in `index.html`
- [x] Clean commit to repository
