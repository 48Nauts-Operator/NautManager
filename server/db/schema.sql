-- Updated schema for the projects table
-- WARNING: Applying this will DROP the existing table and data!

DROP TABLE IF EXISTS projects;
DROP TYPE IF EXISTS project_urgency;
DROP TYPE IF EXISTS project_type;

CREATE TYPE project_urgency AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE project_type AS ENUM ('Business', 'Private');

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    summary TEXT,                    -- New: Short summary
    concept TEXT,                    -- Renamed from description
    local_path VARCHAR(1024) UNIQUE, 
    git_repo VARCHAR(512),
    website_url VARCHAR(512),        -- New: Website URL
    project_category VARCHAR(50),     -- New: Category (e.g., LLM, iOS, WebApp)
    start_commands TEXT,             -- New: Start commands
    tags TEXT[],                     
    deadline DATE,                   
    type project_type DEFAULT 'Private', 
    completion_percentage SMALLINT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    urgency project_urgency DEFAULT 'Medium',
    is_archived BOOLEAN DEFAULT FALSE, -- New: Archive flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log Table
CREATE TABLE activity_log (
    log_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, -- Link to project, cascade delete
    activity_timestamp TIMESTAMP WITH TIME ZONE NOT NULL
    -- activity_type VARCHAR(50) DEFAULT 'update' -- Optional: for future use
);

-- Indexes for activity_log table
CREATE INDEX idx_activity_timestamp ON activity_log(activity_timestamp DESC);
CREATE INDEX idx_activity_project_id ON activity_log(project_id);

-- Indexes for projects table
CREATE INDEX idx_project_name ON projects(name);
CREATE INDEX idx_project_last_updated ON projects(last_updated_at DESC);
CREATE INDEX idx_project_is_archived ON projects(is_archived); -- Add index for filtering

-- Function to update last_updated_at AND log activity
CREATE OR REPLACE FUNCTION update_and_log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
   -- Update timestamp on the project
   NEW.last_updated_at = NOW(); 
   
   -- Log the update activity
   -- We only log if it's an UPDATE, not INSERT
   IF (TG_OP = 'UPDATE') THEN
       INSERT INTO activity_log (project_id, activity_timestamp)
       VALUES (NEW.id, NEW.last_updated_at);
   END IF;

   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the old trigger if it exists (optional, but safer)
DROP TRIGGER IF EXISTS update_projects_last_updated ON projects;

-- Recreate trigger using the new function
CREATE TRIGGER update_projects_activity_trigger
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_and_log_project_activity(); 