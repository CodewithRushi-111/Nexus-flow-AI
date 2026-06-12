# 🌌 NexusFlow AI — Smart Venue Crowd Management Platform

NexusFlow AI is a zero-latency crowd orchestration and venue intelligence platform built using **Next.js 16 (App Router)** and **React 19**. It features a modern, glassmorphic dark-mode interface designed to help venue operators anticipate bottlenecks, simulate incidents, dispatch safety personnel, and compute dynamic detours.

---

## 🚀 Key Features

*   **🎛️ Operations Control Center (`/operations`):**
    *   **Simulate Incident Scenarios:** Seamlessly switch between Standard Operations, Concert Entry Rush, Match Day Egress, Concourse Obstructions, and Egress drills.
    *   **Predictive Occupancy Forecast:** A custom SVG area chart mapping predicted attendance counts over the next 4 hours, which updates dynamically based on the selected mode.
    *   **Live Audit Terminal Logs:** A retro command-line logger that streams live system events, sensor warnings, and dispatcher logs in real time.
*   **🗺️ Spatial Floorplan & Telemetry (`/floorplan`):**
    *   **Interactive Hotspot Matrix:** Visual alerts showing real-time occupancy and average delay wait times for individual venue sectors.
    *   **Thermal Scanner Overlay:** A toggleable thermal-lens heatmap overlaying glowing, density-colored radial gradients across the seating areas of the stadium.
    *   **Officer Dispatch Engine:** Directly assign directive tasks to idle security, safety, or medical staff.
*   **🛣️ Dynamic Routing Engine (`/routes`):**
    *   **AI Pathfinding Bypass:** Computes alternate route configurations and provides step-by-step detour directions to bypass active bottlenecks.
*   **💬 Neural Flow Copilot (`/copilot`):**
    *   **AI Command Assistant:** An interactive conversational assistant powered by Google Gemini, capable of parsing venue status and responding to complex operational queries.
*   **🔒 Secure Entry Access (`/login`):**
    *   A premium authorization dashboard handling credential logging and operator registration.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend Core:** Next.js 16 (App Router), React 19, Lucide Icons, Styled JSX.
*   **State Management:** Unified context state machine (`FlowContext`) built on React's `useReducer` to sync simulated and database-driven venue data.
*   **AI Engine:** Google Gemini 1.5 Flash integration with an automated local rule-based fallback analyzer when keys are absent.
*   **Backend Sync:** Firebase client with dynamic local mock fallback, supporting Firestore real-time collection syncing.

---

## ⚙️ Environment Configuration

To configure the live backend services, create a `.env.local` file in the root directory:

```env
# Google Gemini API Config
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Firestore Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> [!NOTE]
> If these keys are not defined in your environment, the platform automatically starts in **Local Simulation Mode**, using robust heuristic models for the AI Copilot and crowd fluctuations so that the app remains fully testable without external service requirements.

---

## 🏃‍♂️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser.

### 3. Production Build & Linting
Verify TypeScript compilation and page optimization:
```bash
npm run build
```
