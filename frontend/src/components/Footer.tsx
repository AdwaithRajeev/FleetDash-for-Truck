/**
 * Footer.tsx
 * Application footer bar for FleetDash.
 * Week 1 – Static. Displays version, copyright, and tech-stack badges.
 */

import React from 'react';

// ── Component ──────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer className="dash-footer" role="contentinfo" aria-label="FleetDash footer">
    <div className="dash-footer__left">
      <span className="dash-footer__logo" aria-hidden="true">🚛</span>
      <span className="dash-footer__version">
        FleetDash&nbsp;<strong>v1.0</strong>
      </span>
      <span className="dash-footer__separator" aria-hidden="true">·</span>
      <span className="dash-footer__copy">© 2026 Batch 19 Group 13</span>
    </div>

    <div className="dash-footer__right">
      <div className="dash-footer__stack">
        Built with&nbsp;
        <span className="dash-footer__tag dash-footer__tag--react" aria-label="Built with React">
          ⚛ React
        </span>
        <span className="dash-footer__tag dash-footer__tag--ts" aria-label="Built with TypeScript">
          🔷 TypeScript
        </span>
        <span className="dash-footer__tag dash-footer__tag--vite" aria-label="Built with Vite">
          ⚡ Vite
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
