# NautManager - User Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Welcome to NautManager! This guide explains how to use the application to manage your projects.

## What is NautManager?

NautManager is your personal project management dashboard with a dark, cypherpunk/Tron-inspired theme. It helps you keep track of your development projects, view key details, manage concepts, and stay organized.

## Key Features for Users

*   **See All Active Projects:** The main dashboard shows cards for all your non-archived projects.
*   **Quick Navigation:** A persistent sidebar lists active projects for easy access.
*   **Detailed View:** Click any project to see its full details, including summary, concept (with Markdown rendering), paths, links, commands, and status.
*   **Add Projects Manually:** Use the "New Project" button to add projects via a form.
*   **Automatic Project Detection:** Optionally, run a watcher service that automatically adds new projects when you create a corresponding folder structure in your local development directory.
*   **Edit Projects:** Modify project details easily from the detail page.
*   **Archive/Unarchive:** Declutter your main view by archiving completed or inactive projects, which can be viewed separately and reactivated later.
*   **Delete Projects:** Permanently remove projects.

## Using the Application

### The Dashboard (`/`)

*   This is the main landing page.
*   It displays:
    *   The total count of *active* projects.
    *   An "Active Projects" section with cards representing each non-archived project.
*   **Project Cards Show:** Project Name, Urgency Tag, Category Tag, Summary, Completion %, and Last Updated Date.

### Sidebar

*   Located on the left, always visible.
*   **NautManager Title:** Clicking this navigates back to the main Dashboard.
*   **New Project Button:** Opens the modal to add a new project manually.
*   **Projects List:** Shows a clickable list of all *active* project names. Clicking a name navigates to that project's detail page.
    *   The currently viewed project will be highlighted in the sidebar.
*   **View Archived Link:** Navigates to the Archive page (`/archive`).
*   **Settings Link:** (Placeholder for future functionality).

### Project Detail Page (`/projects/:id`)

*   Accessed by clicking a project name in the sidebar or a project card (if linked).
*   **Header:** Displays the project name and buttons to "Edit", "Archive"/"Unarchive", and "Delete". An "Archived" badge appears if the project is archived.
*   **Summary Box:** Shows key status indicators: Type, Organisation, Urgency, Category, Completion %, Deadline (with countdown).
*   **Main Content Area:**
    *   **Summary:** Displays the short project summary.
    *   **Concept:** Renders the detailed project concept/description using Markdown. Long concepts are initially collapsed with a "Read More" button.
    *   **Details Grid:** Shows Local Path, Git Repository link (if provided), and Website URL link (if provided).
    *   **Start Commands:** Displays any specified start commands in a code block.
    *   **Tags:** Lists associated project tags.
    *   **Timestamps:** Shows when the project was created and last updated.

### Creating / Editing Projects (Modal)

*   **Opening:**
    *   Click "New Project" in the sidebar to create.
    *   Click "Edit Project" on the detail page to edit.
*   **Fields:**
    *   `Project Name` (Required)
    *   `Summary` (Optional short description)
    *   `Concept / Description` (Optional detailed description, supports Markdown)
    *   `Development Path` (Optional path on your local machine)
    *   `Git Repository URL` (Optional link to remote repo)
    *   `Website URL` (Optional link to live site/demo)
    *   `Category` (Optional text field, e.g., "WebApp", "LLM")
    *   `Start Commands` (Optional commands to run the project)
    *   `Tags` (Optional comma-separated list)
    *   `Deadline` (Optional date)
    *   `Organisation` (Optional dropdown)
    *   `Type` (Dropdown: WebApp, SaaS Platform, iOS App, Other)
*   **Submitting:**
    *   Click "Initialize Project" (for new) or "Update Project" (for editing).
    *   The form data is sent to the backend.
    *   On success, the modal closes, and the project list in the UI refreshes automatically.

### Archiving Projects

*   Click the "Archive" button on a project's detail page.
*   Confirm the action.
*   The project is flagged as archived in the database and disappears from the main Dashboard/Sidebar lists.
*   Click the "View Archived" link in the sidebar to access the `/archive` page.
*   Archived projects are displayed using the same card format.
*   Click the "Re-activate" button on an archived project card to unarchive it. It will reappear in the main lists.

### Deleting Projects

*   Click the "Delete" button on a project's detail page.
*   Confirm the action.
*   The project is **permanently removed** from the database.
*   You are redirected back to the Dashboard.

### Automatic Project Detection (Watcher Service)

*   This is an **optional** background service run via Docker Compose.
*   **How it works:**
    1.  You configure a main development directory on your computer (e.g., `/Users/me/dev`).
    2.  You start the `watcher` service (`docker-compose up -d watcher`).
    3.  When you create a *new* folder directly inside your configured directory (e.g., `/Users/me/dev/my-cool-project`), the watcher notices it.
    4.  If you *also* create a `docs` subdirectory inside that new folder, containing either a `concept.md` or `README.md` file, the watcher will:
        *   Read the content of the `concept.md` or `README.md` file.
        *   Check if a project with that folder's path already exists in NautManager.
        *   If it doesn't exist, automatically create a new project entry in NautManager using the folder name as the project name, the folder path as the `local_path`, and the file content as the `concept`.
*   **Note:** It only processes folders *directly* inside the configured watch path. It requires the `docs/concept.md` or `docs/README.md` structure to trigger the auto-add. Existing folders are also scanned and added if they meet the criteria and aren't already in NautManager when the watcher starts.

## Getting Started (Technical Setup)

*(This section is for setting up the application locally)*

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
    *   Add the following, adjusting if necessary (these match `docker-compose.yml` defaults):
        ```dotenv
        # PostgreSQL Database Configuration
        DB_HOST=localhost
        DB_PORT=5436
        DB_USER=user
        DB_PASSWORD=password
        DB_NAME=nautmanager_dev

        # Server Port (Optional) - Needs to match docker-compose port mapping if running outside docker
        # PORT=3001 
        ```

5.  **Create Docker Compose Environment File:**
    *   Navigate to the project root (`NautManager/`).
    *   Create a file named `.env`.
    *   Add the following line, replacing the path with the **absolute path** to the single parent directory on your computer that holds all the development project folders you want the *watcher service* to monitor:
        ```dotenv
        # --- Docker Compose specific env vars --- 
        
        # Example: Monitor folders created directly inside /Users/me/dev/projects
        HOST_WATCH_PATH=/Users/your_username/path/to/your/dev/projects 
        
        # You can optionally override DB/Server/Watcher settings here if needed:
        # DB_PORT=5436
        # PORT=3009
        # NAUTMANAGER_API_URL=http://server:3001/api
        # CONTAINER_WATCH_PATH=/watch
        # DEBOUNCE_MS=5000
        ```
    *   **Important:** Ensure this root `.env` file is listed in your main `.gitignore` file.

6.  **Start Database Container:**
    *   Make sure Docker Desktop (or your Docker daemon) is running.
    *   From the project root directory (`NautManager/`):
        ```bash
        docker-compose up -d db
        ```
    *   Wait a few moments for the database to initialize (check `docker-compose logs db`).

7.  **Apply Database Schema:**
    *   Run the schema script to create the necessary tables:
        ```bash
        docker exec -i nautmanager_db psql -U user -d nautmanager_dev < ./server/db/schema.sql
        ```
        *(Note: This script drops existing tables. Use migration tools for production.)*

### Running the Application (via Docker Compose - Recommended)

1.  **Start all services:**
    *   From the project root (`NautManager/`):
        ```bash
        docker-compose up -d --build 
        ```
        *(Use `--build` the first time or after code changes in `server` or `watcher`)*
    *   This starts the database, backend server, and the optional watcher.
    *   Check logs: `docker-compose logs -f` (or `docker-compose logs -f server`, `docker-compose logs -f watcher`)
    *   The backend API will be available on the host at `http://localhost:3009` (or the `PORT` set in `.env`).

2.  **Start the Frontend Development Server:**
    *   Open a separate terminal in the `client` directory.
    *   Run: `npm run dev`
    *   The frontend should start (defaults to `http://localhost:5177`).

3.  **Open the App:**
    *   Navigate to `http://localhost:5177` in your web browser.

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

This project is licensed under the MIT License. 