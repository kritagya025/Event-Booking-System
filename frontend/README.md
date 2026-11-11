# EventHub Frontend SPA

The official single-page application (SPA) client for the **EventHub** live event ticketing and real-time seat reservation platform. Built with React 19, Vite 8, Tailwind CSS, Lucide React, and STOMP over SockJS.

---

## Table of Contents

- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [Technology Stack](#technology-stack)
- [Directory Hierarchy](#directory-hierarchy)
- [Component Inventory](#component-inventory)
- [Interactive Seating Engine](#interactive-seating-engine)
- [State Management & Real-Time Sync](#state-management--real-time-sync)
- [Performance Engineering](#performance-engineering)
- [Development & Build Scripts](#development--build-scripts)
- [Environment Configuration](#environment-configuration)
- [Continuous Integration (CI)](#continuous-integration-ci)

---

## Overview

EventHub Frontend provides a responsive, high-throughput user experience for discovering live events, inspecting interactive seating layouts (both standard concert arenas and cinema premieres), locking seats with distributed 10-minute mutexes, completing multi-currency purchases, and managing admission tickets with cryptographic QR codes.

---

## Design Philosophy

The interface follows the **90s Brutalist Warehouse Acid-Zine Protocol**:

- **Strict Rectangular Geometry**: 0px border radius (`rounded-none`), heavy structural framing, and tactile industrial styling.
- **High-Voltage Palette**: Asphalt Black (`#0e0e11`), Acid Yellow (`#eefc54`), Neon Magenta (`#ff1f6d`), and Electric Cobalt (`#1d4ed8`).
- **Tactile Drop Shadows**: Hard 3D offset solid shadow stamps (`shadow-[4px_4px_0px_#ffffff]` and `shadow-[4px_4px_0px_#eefc54]`).
- **Typography Scale**: Display headings in `Bebas Neue`, button actions in `Oswald`, technical specifications in `Courier Prime`, and real-time telemetry in `JetBrains Mono`.
- **Zero AI-Tells**: Replaces generic pastel gradients and soft blurred glass with hazard caution tapes, perforated admission ticket stubs, CRT scanlines, and real-time connection counters.
- **Monochrome Sold-Out Distinction**: Sold-out events instantly render in high-contrast grayscale with distinct "SOLD OUT" stamps and disabled interactions.
- **Site-Wide Skeleton Loaders**: Zero Cumulative Layout Shift (CLS) through bespoke industrial pulse skeletons matching identical layout dimensions.

---

## Technology Stack

| Layer | Library / Tool | Version | Role |
|---|---|---|---|
| UI Framework | React | 19.2.8 | Declarative component architecture |
| DOM Renderer | React DOM | 19.2.8 | Virtual DOM diffing & browser rendering |
| Bundler & Dev Server | Vite | 8.2.0 | Instant HMR, ESM bundling, and Rollup build pipeline |
| Styling | Tailwind CSS | 3.4.19 | Utility-first CSS engine with custom brutalist tokens |
| Iconography | Lucide React | 1.28.0 | Statically tree-shaken SVG icon suite |
| Linter | Oxlint | 1.75.0 | High-performance Rust-based static code analysis |
| Real-Time STOMP | @stomp/stompjs | 7.3.0 | STOMP protocol over WebSocket transport |
| Socket Fallback | sockjs-client | 1.6.1 | HTTP-based WebSocket emulation fallback |
| Celebrations | canvas-confetti | 1.9.4 | High-performance canvas celebratory confetti on order completion |

---

## Directory Hierarchy

```
frontend/
|-- index.html                 # Single-page application HTML entry template
|-- package.json               # Dependencies, scripts, and engine specifications
|-- vite.config.js             # Vite configuration with proxy rules and manual chunk splitting
|-- tailwind.config.js         # Brutalist color tokens, font families, and shadow utilities
|-- postcss.config.js          # PostCSS engine pipeline (Tailwind & Autoprefixer)
`-- src/
    |-- main.jsx               # React DOM bootstrap
    |-- App.jsx                # Root layout coordinator, routing, theme state, and global modals
    |-- App.css                # Component layout and responsive positioning
    |-- index.css              # Global styles, font faces, hazard tapes, and custom animations
    |-- assets/                # Static assets (optimized WebP hero images and logos)
    |-- components/            # UI Component Library (27 components)
    `-- services/              # API, WebSocket, and currency utility clients
```

---

## Component Inventory

The frontend architecture comprises 27 modular components:

### Primary Views & Modals
1. **`Navbar.jsx`**: Global brutalist navigation bar with logo stamp, multi-currency switcher, quick links, theme toggle, authentication state, and high-contrast mobile navigation drawer.
2. **`BackstageAuthTerminal.jsx`**: Creative split-screen holographic VIP backstage pass accreditation terminal with real-time reactive pass rendering, audio VU password meter, mobile-first column reordering, and 1-click demo fills.
3. **`SeatMapModal.jsx`**: Interactive multi-tier arena and cinema seating engine with real-time seat lock countdowns, pricing tiers, adjacent seat pairing, touch momentum scrolling, and sticky checkout dock.
4. **`AdminDashboard.jsx`**: Operational metrics, revenue analytics, event capacity monitoring, and responsive system diagnostic gauges for administrators.
5. **`MyBookings.jsx`**: Customer portal displaying ticket history, QR code admission passes, PDF invoice downloads, and offline booking cancellation reconciliation.
6. **`ProfileDashboard.jsx`**: User profile management, password updates, account security controls, and session-authenticated ticket PDF downloads (`credentials: 'include'`).
7. **`Wishlist.jsx`**: Customer saved events collection with instant booking shortcuts and responsive grid layouts.
8. **`AuthModal.jsx`**: Unified login, registration, and password recovery modal with tab switching.
9. **`CreateEventModal.jsx`**: Event creation and editing modal for organizers with category, venue, and pricing configuration.
10. **`CheckInModal.jsx`**: Optical QR camera scanner and manual ticket serial validator for venue gate staff.
11. **`DatabaseConsoleModal.jsx`**: In-browser diagnostic SQL/table viewer for administrators.
12. **`SystemStatusModal.jsx`**: Live system health telemetry dialog exposing JVM, memory, and database status.
13. **`ApiDocsModal.jsx`**: Embedded OpenAPI 3.0 documentation explorer.
14. **`CookiesModal.jsx`**: Cookie preferences and session persistence disclosure.
15. **`PrivacyModal.jsx`**: Data privacy statement and GDPR/compliance policy.
16. **`TermsModal.jsx`**: Ticketing service terms, refund regulations, and venue admission rules.
17. **`LoginPage.jsx`**: Standalone customer/organizer authentication page with responsive form geometry.
18. **`RegisterPage.jsx`**: Standalone customer account onboarding page with mobile touch accessibility.

### Graphic Engines & Safety Components
18. **`Background3D.jsx`**: Bespoke acoustic resonance harmonic waveform canvas engine with interactive mouse impulse physics and wireframe concert ticket pass models.
19. **`IntroSplashScreen.jsx`**: High-voltage industrial boot splash screen with telemetry diagnostics.
20. **`ErrorBoundary.jsx`**: React error boundary catching render crashes with a fallback recovery UI.

### Skeleton Loaders Suite (Zero CLS)
21. **`EventCardSkeleton.jsx`**: Skeleton placeholder matching the exact geometry of catalog event cards.
22. **`SeatMapSkeleton.jsx`**: Skeleton placeholder for the arena and cinema seat matrix.
23. **`AdminDashboardSkeleton.jsx`**: Skeleton placeholder for admin metric cards, revenue graphs, and tables.
24. **`BookingCardSkeleton.jsx`**: Skeleton placeholder for customer booking tickets.
25. **`WishlistCardSkeleton.jsx`**: Skeleton placeholder for saved event bookmark cards.
26. **`ProfileSkeleton.jsx`**: Skeleton placeholder for account profile fields.

---

## Interactive Seating Engine

The `SeatMapModal` supports two layout modes:

1. **Concert Arena / Amphitheater Mode**:
   - Curved multi-row stage configuration (`VIP`, `PREMIUM`, `REGULAR` tiers).
   - Stage sound towers, acoustic center aisle, and radar telemetry HUD.
   - Real-time seat hold states: Available, Selected, Locked by Another User, and Booked.
2. **Cinema Premiere Mode**:
   - Curved high-contrast projection screen with sweeping spotlights.
   - Central aisle partitioning with theater row labeling (`A` through `Z`).
   - Sound tower beacons and directional viewing angle indicators.

### 10-Minute Concurrency Mutex
When a user selects seats, temporary locks are acquired via `POST /api/seats/lock`. A synchronized 10-minute countdown timer displays remaining lock time. State changes are received instantly via WebSocket STOMP subscriptions.

---

## State Management & Real-Time Sync

- **Authentication**: JWT tokens stored in `localStorage` and synchronized via custom events across browser tabs. Automatic Authorization header injection in `services/api.js`.
- **Multi-Currency Engine**: `services/currency.js` provides instant dynamic rate conversions across USD, EUR, GBP, JPY, CAD, AUD, and INR.
- **WebSocket Gateway**: `services/websocket.js` manages STOMP connections over `/ws` using SockJS fallback with automatic backoff reconnection.

---

## Performance Engineering

1. **WebP Compression**: All high-resolution raster images converted to modern `.webp` format, reducing image payloads by over 80%.
2. **Dynamic Manual Chunk Splitting**: Configured in `vite.config.js` to prevent monolithic bundles:
   - `vendor-react`: `react`, `react-dom`
   - `vendor-icons`: `lucide-react`
   - `vendor-socket`: `@stomp/stompjs`, `sockjs-client`
3. **Static Tree-Shaking**: Dynamic icon maps replaced with static icon dictionary lookups, eliminating over 1,500 unneeded Lucide icon definitions from the build.
4. **Oxlint Integration**: Replaced heavy ESLint configurations with Rust-powered `oxlint`, achieving complete static analysis across 34 files in under 30 milliseconds.
5. **Terser Minification**: Production builds strip `console.log` and `debugger` statements.

---

## Development & Build Scripts

Execute commands from the `frontend/` directory:

```bash
# Install dependencies
npm ci

# Launch Vite development server with HMR
npm run dev

# Run high-performance Oxlint static analysis
npm run lint

# Build production bundle with Rollup chunk splitting
npm run build

# Preview production build locally
npm run preview
```

---

## Environment Configuration

Create a `.env` or `.env.local` file in `frontend/` if overriding default endpoints:

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Base path for backend REST API calls (proxied in Vite dev) |
| `VITE_WS_URL` | `/ws` | Base path for WebSocket STOMP endpoint (proxied in Vite dev) |

---

## Continuous Integration (CI)

The frontend is continuously tested, linted, and built on every commit and pull request modifying `frontend/**` via GitHub Actions ([`.github/workflows/frontend.yml`](../.github/workflows/frontend.yml)):

- Sets up Node.js 20 with npm caching.
- Runs `npm ci` for deterministic dependency installation.
- Runs `npm run lint` (`oxlint`) to verify code hygiene.
- Runs `npm run build` to verify production compilation.
- Archives the resulting `frontend/dist/` build artifact.
