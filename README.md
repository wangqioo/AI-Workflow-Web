# AI-Workflow-Web

Lightweight web frontend for [AI-Workflow-Terminal](https://github.com/wangqioo/AI-Workflow-Terminal) -- a local AI operating system running on NVIDIA Jetson Orin + DGX Spark2.

## Architecture

```
┌─────────────────────────────────┐
│     AI-Workflow-Web (SPA)       │  React + Vite + Tailwind
│                                 │  Single Page Application
│  Dashboard | Chat | Workflows   │
│  Apps | Tasks | Settings        │
└──────────┬──────────┬───────────┘
           │          │
    HTTP/REST     SSE Stream
           │          │
┌──────────▼──┐ ┌─────▼──────────┐
│   Engine    │ │   OpenClaw     │
│   Gateway   │ │   Gateway      │
│   :8100     │ │   :18789       │
└──────┬──────┘ └──────┬─────────┘
       │               │
┌──────▼───────────────▼─────────┐
│   AI-Workflow-Terminal Backend  │
│   44 Python Microservices      │
│   Ports 8000-8131              │
└────────────────────────────────┘
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS 4** (styling)
- **React Router 7** (navigation)
- **Lucide React** (icons)
- **Zero backend dependencies** -- connects directly to existing Terminal services

## Features

| Page | Description |
|------|-------------|
| **Dashboard** | System status, connection health, CPU/GPU/memory metrics |
| **AI Chat** | OpenClaw conversation with SSE streaming, session history, model switching (4B/35B) |
| **Workflows** | Browse, install, and run workflow packages (.ocw) |
| **Apps** | Launcher for all 19+ backend services (AI, hardware, tools, system) |
| **Tasks** | Cross-device task management via Task Agent + Cloud Relay |
| **Settings** | Gateway addresses, model selection, language preferences |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

On first load, the app auto-detects the backend address from `window.location.hostname`. You can configure endpoints in **Settings**:

- **Engine Gateway**: `http://<host>:8100` (backend services)
- **OpenClaw Gateway**: `http://<host>:18789` (AI chat)

Settings are persisted in `localStorage`.

## Deployment

### Static File Server

```bash
npm run build
# Serve the `dist/` folder with any HTTP server
python3 -m http.server 3080 -d dist
```

### On Jetson Orin (alongside Terminal backend)

```bash
# Build and serve
npm run build
cp -r dist/ /opt/ai-workflow-web/
# Add to nginx or serve directly
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Development

```
src/
├── api/              # API clients (Engine Gateway, OpenClaw SSE)
├── components/       # Reusable UI components
│   ├── chat/         # Chat-specific components
│   ├── common/       # Shared components (Card, StatusBadge)
│   ├── Layout.tsx    # Main layout with sidebar
│   ├── Sidebar.tsx   # Navigation sidebar
│   └── Header.tsx    # Top header with status indicators
├── hooks/            # Custom React hooks
├── pages/            # Page components (Dashboard, Chat, etc.)
├── store/            # Settings store
├── App.tsx           # Root component with router
└── main.tsx          # Entry point
```

## Comparison with Original Clients

| | Flutter Desktop | Flutter Mobile | Tauri PC | **Web (this)** |
|---|---|---|---|---|
| Lines of code | ~48,000 | ~15,000 | ~3,000 | **~2,000** |
| Platforms | Linux ARM64 | Android/iOS | Win/Mac/Linux | **All** |
| Install required | Yes | Yes | Yes | **No** |
| Auto-update | Manual | Store | Manual | **Instant** |
| Hardware access | Direct | WiFi LAN | WiFi LAN | **WiFi LAN** |

## License

MIT
