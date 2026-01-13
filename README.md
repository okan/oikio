# oikio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg)](https://www.typescriptlang.org/)

A **local-first** desktop application designed to streamline 1-1 meeting management. Keep your notes, action items, and relationship goals in one secure, private place.

![oikio Dashboard](assets/app-screenshot.png)

## Why oikio?

In an era of cloud-everything, Oikio takes a different path. It's built for professionals who value:
- **Privacy:** Your sensitive 1-1 notes never leave your machine.
- **Speed:** Zero latency. No loading spinners while waiting for a server.
- **Reliability:** Works perfectly offline. Always ready when you are.

---

## Key Features

### 🤝 Person Management
- Maintain a directory of managers, direct reports, and teammates.
- Set meeting frequency goals (weekly, biweekly, monthly) to stay consistent.
- Visual "Relationship Health" indicators to see who needs attention.

### 📝 Smart Meeting Notes
- Clean, distraction-free rich text editor powered by **TipTap**.
- Markdown support for quick formatting.
- Reusable templates to standardize your 1-1 structure.

### 🚀 Action Item Tracking
- Capture to-dos during meetings so nothing falls through the cracks.
- Track ownership (Self vs. Others) and due dates.
- Global "Actions" view to manage all pending tasks in one place.

### ⚙️ Power Features
- **Local Storage:** All data stored in a simple JSON file on your disk.
- **Data Portability:** Easy JSON export and import for backups or migration.
- **Reminders:** Built-in notifications for upcoming meetings and overdue tasks.
- **Multi-language:** Full support for English and Turkish.

---

## Tech Stack

### Frontend & UI
- **React 18** + **Vite**: Modern, fast frontend development.
- **TailwindCSS**: Utility-first styling for a premium look.
- **Radix UI**: Accessible, unstyled primitives for robust components.
- **Framer Motion**: Smooth animations and transitions.
- **Lucide React**: Clean and consistent iconography.

### Desktop & Backend
- **Electron**: Cross-platform desktop framework.
- **Zustand**: Lightweight and scalable state management.
- **i18next**: Professional-grade internationalization.
- **Zod**: Schema validation for data integrity.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Recommended: v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/oikio.git

# Navigate to project directory
cd oikio

# Install dependencies
npm install
```

### Development
```bash
# Run in development mode (Vite + Electron)
npm run electron:dev

# Run Vite dev server only (Web preview)
npm run dev

# Lint & Format
npm run lint
npm run format
```

### Building
```bash
# Build for production (outputs to /release)
npm run build
```

---

## Project Structure

```text
├── electron/          # Electron main process & IPC handlers
├── src/               # React frontend source code
│   ├── components/    # Reusable UI & domain components
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Localization files (JSON)
│   ├── lib/           # Utility functions & shared logic
│   ├── pages/         # Page-level components
│   ├── store/         # Zustand state stores
│   └── types/         # TypeScript definitions
├── assets/            # Static assets for README/Docs
└── public/            # Static assets for the application
```

---

## License

Distributed under the **MIT License**.

