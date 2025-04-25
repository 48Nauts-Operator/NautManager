# NautManager Project Summary

**NautManager** is a web-based project management dashboard designed with a distinct dark, cypherpunk/Tron aesthetic. It serves as a central hub for developers or individuals to track and manage their software development projects.

## Core Functionality

*   **Project Tracking:** Allows users to manually add projects via a web form or automatically detect new projects created in a specified local development directory.
*   **Information Display:** Presents projects in a dashboard view using cards showing key details (name, summary, urgency, completion, category, last update). A dedicated detail page provides comprehensive information, including a Markdown-rendered concept/description.
*   **Management:** Supports creating, reading, updating, deleting, and archiving/unarchiving projects.
*   **Navigation:** Features a sidebar for quick navigation between active projects and a separate view for archived projects.

## Key Technologies

*   **Frontend:** React (Vite), Tailwind CSS, React Router
*   **Backend:** Node.js (Express)
*   **Database:** PostgreSQL
*   **Automation:** Node.js filesystem watcher (Chokidar) service.
*   **Containerization:** Docker & Docker Compose (for DB, Backend, Watcher)

## How It Works

The system comprises:
1.  A React frontend providing the user interface.
2.  An Express backend API handling data persistence and logic.
3.  A PostgreSQL database storing project metadata.
4.  An optional background watcher service that monitors a local directory, reads `docs/concept.md` or `docs/README.md` from new project folders, and automatically creates corresponding entries in NautManager via the API. 