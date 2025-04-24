# NautManager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web-based project management dashboard with a distinct dark, cypherpunk/Tron aesthetic. Allows users to add, view, archive, and manage software development projects.

![Screenshot Placeholder](./docs/screenshot_placeholder.png) 
*(Add a screenshot here later)*

## Features

*   **Project Dashboard:** View active projects in a card layout.
*   **Sidebar Navigation:** Quick access list of active projects.
*   **Project Details:** View comprehensive details for each project (concept, path, repo, website, commands, dates, etc.).
*   **CRUD Operations:** Create, Read, Update, Delete projects.
*   **Archiving:** Archive and unarchive projects.
*   **Dedicated Archive View:** Separate page to view archived projects.
*   **Dark Theme:** Sleek, dark UI with Tron-inspired cyan accents using Tailwind CSS.
*   **Markdown Support:** Project concepts/descriptions rendered with Markdown and syntax highlighting.
*   **Responsive Design:** Basic responsiveness implemented.

## Technology Stack

*   **Frontend:** React (Vite), Tailwind CSS, React Router DOM
*   **Backend:** Node.js, Express, CORS
*   **Database:** PostgreSQL
*   **Containerization:** Docker, Docker Compose
*   **Code Formatting:** (Implicitly via Editor/Prettier)

## Project Structure

```
NautManager/
├── client/           # React Frontend (Vite + Tailwind)
│   ├── public/
│   │   └── ...           # Config files (vite, tailwind, etc.)
│   └── ...           # Config files (vite, tailwind, etc.)
├── server/           # Node.js Backend (Express)
│   ├── db/           # Database connection & schema
│   ├── src/          # Source files
│   │   ├── controllers/
│   │   └── routes/
│   ├── .env          # Environment variables (DB config - MUST BE CREATED)
│   ├── server.js   # Express server entry point
│   └── package.json
├── docs/             # Documentation (concept, sprint plan, tasks)
├── .dockerignore
├── .gitignore
├── docker-compose.yml # Docker config for PostgreSQL DB
└── README.md        # This file
```

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm (usually comes with Node.js)
*   Docker & Docker Compose

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/48Nauts-Operator/NautManager.git
    cd NautManager
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd client
    npm install
    cd .. 
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

4.  **Create Backend Environment File:**
    *   Navigate to the `server` directory.
    *   Create a file named `.env`.
    *   Copy the contents from `.env.example` (if it exists) or add the following, adjusting if necessary (these match `docker-compose.yml` defaults):
        ```dotenv
        # PostgreSQL Database Configuration
        DB_HOST=localhost
        DB_PORT=5436
        DB_USER=user
        DB_PASSWORD=password
        DB_NAME=nautmanager_dev

        # Server Port (Optional)
        # PORT=3001
        ```

5.  **Start Database Container:**
    *   Make sure Docker Desktop (or your Docker daemon) is running.
    *   From the project root directory (`NautManager/`):
        ```bash
        docker-compose up -d db
        ```
    *   Wait a few moments for the database to initialize.

6.  **Apply Database Schema:**
    *   Run the schema script to create the necessary tables:
        ```bash
        docker exec -i nautmanager_db psql -U user -d nautmanager_dev < ./server/db/schema.sql
        ```
        *(Note: If you previously had data, this default script drops tables. Use migration tools for production scenarios.)*

### Running the Application

1.  **Start the Backend Server:**
    *   Open a terminal in the `server` directory.
    *   Run: `npm run dev`
    *   The server should start (defaults to `http://localhost:3001`). Check for a database connection success message.

2.  **Start the Frontend Development Server:**
    *   Open a separate terminal in the `client` directory.
    *   Run: `npm run dev`
    *   The frontend should start (defaults to `http://localhost:5177`).

3.  **Open the App:**
    *   Navigate to `http://localhost:5177` (or the port specified by Vite) in your web browser.

## TODO / Future Features

*   Implement Gantt Chart view.
*   Improve form validation (client/server side).
*   Add user authentication.
*   Enhance Git integration (read commits, branches).
*   Integrate AI agents for insights/prioritization.
*   Add workspace theming options.
*   Implement database migrations instead of drop/recreate schema.
*   Add unit/integration tests.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file (if added) for details. 