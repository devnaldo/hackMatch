# 💻 HackMatch — Frontend Client

The frontend client for **HackMatch**, built using **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Overview

The client interface provides a real-time, responsive experience for hackathon participants and team leaders.

### Key Capabilities:
- **Smart Teammate Matching**: View algorithmic compatibility scores and match recommendations.
- **Real-Time Team Chat**: Socket.IO-powered chat room with active typing indicators and persistent message logs.
- **Hackathon Explorer**: Discover active hackathons, filter by date or track, and signal participation.
- **Project Ideation Board**: Submit, browse, and upvote ideas with live vote counts.
- **Team Management**: Create teams, invite members by email, and manage incoming join requests.
- **Modern State Management**: Global auth and real-time notification feeds handled by lightweight Zustand stores.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios (with automatic JWT bearer token interceptors)
- **Real-Time Client**: Socket.IO Client
- **State Stores**: Zustand

---

## 📦 Scripts

- `npm run dev`: Launch local Vite development server
- `npm run build`: Type-check (`tsc -b`) and bundle for production
- `npm run preview`: Preview production build locally
