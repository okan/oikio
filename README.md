# oikio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg)](https://www.typescriptlang.org/)

A **local-first** desktop app designed to help you keep track of 1-1 meetings with your managers, teammates, and reports. Stay organized with your notes, actions, and relationships in a secure and fast way.

![oikio Dashboard](assets/app-screenshot.png)

## Why oikio?

Unlike cloud-based tools, oikio takes a different approach:
- **Privacy:** Your sensitive 1-1 notes never leave your machine.
- **Speed:** Zero lag. Everything happens instantly.
- **Offline:** No internet? No problem. Your notes are always with you.

---

## Key Features

### 🤝 People Management
- Keep a list of your teammates and managers.
- Set meeting frequency goals like weekly, biweekly, or monthly.
- See who needs your attention at a glance with "Need Attention" indicators.

### 📝 Smart Meeting Notes
- Clean, distraction-free rich text editor powered by **TipTap**.
- Markdown support for quick note-taking.
- Use templates to keep your meetings consistent.

### 🚀 Action Items
- Quickly capture action items during your meetings.
- Track ownership (Me vs. Them) and due dates.
- See all your pending tasks in one global view.

### ⚙️ Other Goodies
- **Local Storage:** All data is kept in a simple JSON file on your disk.
- **Data Portability:** Easily export or import JSON for backups or moving data.
- **Notifications:** Get reminded about upcoming meetings and overdue actions.
- **Multi-language:** Full support for English and Turkish.

---

## Tech Stack

### Frontend & UI
- **React 18** + **Vite**
- **TailwindCSS** + **Radix UI**
- **Framer Motion**
- **Lucide React**

### Desktop & Backend
- **Electron**
- **Zustand** (State management)
- **i18next** (Localization)
- **Zod** (Schema validation)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation
```bash
# Clone the repo
git clone https://github.com/yourusername/oikio.git

# Go to the project folder
cd oikio

# Install dependencies
npm install
```

### Development
```bash
# Run in dev mode (Vite + Electron)
npm run electron:dev

# Web preview only
npm run dev

# Lint & Format
npm run lint
npm run format
```

### Build
```bash
# Build for production (outputs to /release)
npm run build
```

---

## Project Structure

```text
├── electron/          # Electron main process & IPC handlers
├── src/               # React frontend source code
│   ├── components/    # UI and domain components
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Localization files (JSON)
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   ├── store/         # Zustand state management
│   └── types/         # TypeScript definitions
├── assets/            # README and doc images
└── public/            # Static assets for the app
```

---

## License

Distributed under the **MIT License**.
