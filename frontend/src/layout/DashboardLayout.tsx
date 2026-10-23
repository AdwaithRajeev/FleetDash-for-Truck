/**
 * DashboardLayout.tsx
 * Shared layout wrapper: Sidebar + Header + scrollable page content.
 * Week 1 – Static layout. Ready for context providers / socket wrappers.
 *
 * UI Enhancement: Added bg-grid and bg-particles overlay layers
 * for the premium animated background. Particles are rendered via
 * inline CSS custom properties – no external libraries needed.
 */

import React, { useEffect, useRef } from 'react';
import Sidebar, { type NavId } from '../components/Sidebar';
import Header from '../components/Header';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  activePage?: NavId;
  onNavigate?: (id: NavId) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
  onRefresh?: () => void;
  alertCount?: number;
  
}

// ── Particle configuration ─────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

// ── Component ──────────────────────────────────────────────────────────────────

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  activePage = 'dashboard',
  onNavigate = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  onLogout = () => {},
  onRefresh = () => {},
  alertCount = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  // Animated floating particles on background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Spawn particles
    const count = 55;
    particlesRef.current = Array.from({ length: count }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      size:   Math.random() * 2.2 + 0.4,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.28,
      opacity: Math.random() * 0.45 + 0.1,
      hue:    Math.random() > 0.6 ? 215 : 195, // blue or cyan hues
    }));

    // Connection line pairs (logistics hubs — fixed positions scaled to viewport)
    const hubPositions = [
      { rx: 0.14, ry: 0.21 },
      { rx: 0.45, ry: 0.19 },
      { rx: 0.63, ry: 0.19 },
      { rx: 0.46, ry: 0.51 },
      { rx: 0.77, ry: 0.61 },
      { rx: 0.17, ry: 0.54 },
    ];

    const connections: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [2, 4],
    ];

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const hubs = hubPositions.map(h => ({
        x: h.rx * canvas.width,
        y: h.ry * canvas.height,
      }));

      // Draw animated connection lines
      connections.forEach(([a, b]) => {
        const ha = hubs[a];
        const hb = hubs[b];
        const progress = ((frame * 0.4) % 100) / 100;

        const grad = ctx.createLinearGradient(ha.x, ha.y, hb.x, hb.y);
        grad.addColorStop(0,        'rgba(79,140,255,0)');
        grad.addColorStop(Math.max(0, progress - 0.25), 'rgba(79,140,255,0)');
        grad.addColorStop(progress,  'rgba(79,140,255,0.35)');
        grad.addColorStop(Math.min(1, progress + 0.25), 'rgba(0,212,255,0.15)');
        grad.addColorStop(1,        'rgba(0,212,255,0)');

        ctx.beginPath();
        ctx.moveTo(ha.x, ha.y);
        ctx.lineTo(hb.x, hb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Draw hub pulse rings
      hubs.forEach((hub, i) => {
        const pulsePhase = (frame * 0.015 + i * 0.5) % (2 * Math.PI);
        const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;

        // Outer ring
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 8 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(79,140,255,${0.15 * (1 - pulse)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,140,255,${0.5 + pulse * 0.4})`;
        ctx.fill();

        // Glow
        const grd = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, 14);
        grd.addColorStop(0, `rgba(79,140,255,${0.18 * pulse})`);
        grd.addColorStop(1, 'rgba(79,140,255,0)');
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Draw floating particles
      particlesRef.current.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < -10)  p.x = canvas.width + 10;
        if (p.x > canvas.width + 10)  p.x = -10;
        if (p.y < -10)  p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grd.addColorStop(0, `hsla(${p.hue},90%,70%,${p.opacity})`);
        grd.addColorStop(1, `hsla(${p.hue},90%,70%,0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="dashboard-shell">
      {/* Animated background grid overlay */}
      <div className="bg-grid" aria-hidden="true" />

      {/* Animated particles canvas */}
      
      {/* Left navigation sidebar */}
      <Sidebar
  activeId={activePage}
  onNavigate={onNavigate}
/>

      {/* Right: header + page content */}
      <div className="main-content">
  <Header
  title={pageTitle}
  subtitle={pageSubtitle}
  searchQuery={searchQuery}
  onSearchChange={onSearchChange}
  onLogout={onLogout}
  onRefresh={onRefresh}
  alertCount={alertCount}
/>

        {/* Scrollable page body */}
        <main className="page-content" id="main-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
