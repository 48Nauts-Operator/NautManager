// Placeholder functions for project-related logic
// We'll use the query function from db/index.js here

import { query } from '../../db/index.js'; // Correct relative path

// GET /api/projects
export const getAllProjects = async (req, res) => {
  // Check for query parameter ?archived=true
  const showArchived = req.query.archived === 'true'; 
  console.log(`Controller: getAllProjects called (showArchived: ${showArchived})`);
  
  // Base query
  let selectQuery = 'SELECT * FROM projects';
  const queryParams = [];

  // Add WHERE clause based on the query parameter
  if (showArchived) {
    selectQuery += ' WHERE is_archived = true';
  } else {
    // Default: only show non-archived projects
    selectQuery += ' WHERE is_archived = false';
  }

  // Add ordering
  selectQuery += ' ORDER BY last_updated_at DESC';

  try {
    const { rows } = await query(selectQuery, queryParams);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// GET /api/projects/:id
export const getProjectById = async (req, res) => {
  const { id } = req.params;
  console.log(`Controller: getProjectById called with ID: ${id}`);
  
  // Basic validation for ID
  if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'Invalid project ID format' });
  }

  const selectQuery = 'SELECT * FROM projects WHERE id = $1';

  try {
    const { rows } = await query(selectQuery, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(rows[0]); // Return the found project
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// POST /api/projects
export const createProject = async (req, res) => {
  console.log("Controller: createProject called with body:", req.body);
  const {
    name,
    summary = null,
    concept = null,
    local_path,
    git_repo = null, 
    website_url = null,
    project_category = null,
    start_commands = null,
    tags = [],
    description = null,
    deadline = null,
    type = 'Private',
    completion_percentage = 0,
    urgency = 'Medium',
  } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  if (local_path && typeof local_path !== 'string') {
      return res.status(400).json({ message: 'Invalid local_path format' });
  }

  const insertQuery = `
    INSERT INTO projects (name, summary, concept, local_path, git_repo, website_url, project_category, start_commands, tags, deadline, type, completion_percentage, urgency)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *; 
  `;

  const values = [
    name,
    summary,
    concept,
    local_path,
    git_repo,
    website_url,
    project_category,
    start_commands,
    tags,
    deadline,
    type,
    completion_percentage,
    urgency,
  ];

  try {
    const { rows } = await query(insertQuery, values);
    res.status(201).json(rows[0]); // Return the newly created project
  } catch (error) {
    console.error('Error creating project:', error);
    // Handle potential unique constraint violation for local_path
    if (error.code === '23505' && error.constraint === 'projects_local_path_key') {
        return res.status(409).json({ message: 'Project with this local path already exists', error: error.message });
    }
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// PUT /api/projects/:id
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    summary,
    concept,
    local_path,
    git_repo,
    website_url,
    project_category,
    start_commands,
    tags,
    description,
    deadline,
    type,
    completion_percentage,
    urgency,
  } = req.body;

  console.log(`Controller: updateProject called for ID: ${id} with body:`, req.body);

  // Basic validation
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: 'Invalid project ID format' });
  }
  // Add more validation as needed for specific fields
  if (name === '') {
    return res.status(400).json({ message: 'Project name cannot be empty' });
  }

  // Construct SET clause dynamically based on provided fields
  // IMPORTANT: Also updates last_updated_at via trigger
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
  if (summary !== undefined) { fields.push(`summary = $${paramIndex++}`); values.push(summary); }
  if (concept !== undefined) { fields.push(`concept = $${paramIndex++}`); values.push(concept); }
  if (local_path !== undefined) { fields.push(`local_path = $${paramIndex++}`); values.push(local_path); }
  if (git_repo !== undefined) { fields.push(`git_repo = $${paramIndex++}`); values.push(git_repo); }
  if (website_url !== undefined) { fields.push(`website_url = $${paramIndex++}`); values.push(website_url); }
  if (project_category !== undefined) { fields.push(`project_category = $${paramIndex++}`); values.push(project_category); }
  if (start_commands !== undefined) { fields.push(`start_commands = $${paramIndex++}`); values.push(start_commands); }
  if (tags !== undefined) { fields.push(`tags = $${paramIndex++}`); values.push(tags); }
  if (deadline !== undefined) { fields.push(`deadline = $${paramIndex++}`); values.push(deadline); }
  if (type !== undefined) { fields.push(`type = $${paramIndex++}`); values.push(type); }
  if (completion_percentage !== undefined) { fields.push(`completion_percentage = $${paramIndex++}`); values.push(completion_percentage); }
  if (urgency !== undefined) { fields.push(`urgency = $${paramIndex++}`); values.push(urgency); }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields provided for update' });
  }

  values.push(id); // Add the ID for the WHERE clause

  const updateQuery = `
    UPDATE projects
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *; 
  `;

  try {
    const { rows } = await query(updateQuery, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found for update' });
    }
    res.status(200).json(rows[0]); // Return the updated project
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    // Handle potential unique constraint violation for local_path
    if (error.code === '23505' && error.constraint === 'projects_local_path_key') {
        return res.status(409).json({ message: 'Another project with this local path already exists', error: error.message });
    }
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  console.log(`Controller: deleteProject called for ID: ${id}`);

  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: 'Invalid project ID format' });
  }

  const deleteQuery = 'DELETE FROM projects WHERE id = $1 RETURNING id;'; // RETURNING helps confirm deletion

  try {
    const { rowCount } = await query(deleteQuery, [id]); // Use rowCount to check if delete happened
    
    if (rowCount === 0) {
      // If no rows were deleted, the project ID likely didn't exist
      return res.status(404).json({ message: 'Project not found for deletion' });
    }

    // Successfully deleted
    res.status(204).send(); // 204 No Content is standard for successful DELETE

  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// PUT /api/projects/:id/archive - Toggle archive status
export const toggleArchiveStatus = async (req, res) => {
  const { id } = req.params;

  console.log(`Controller: toggleArchiveStatus called for ID: ${id}`);

  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: 'Invalid project ID format' });
  }

  const selectQuery = 'SELECT is_archived FROM projects WHERE id = $1';
  const updateQuery = 'UPDATE projects SET is_archived = $1, last_updated_at = NOW() WHERE id = $2 RETURNING *';

  try {
    // 1. Fetch current status
    const { rows: selectRows, rowCount: selectCount } = await query(selectQuery, [id]);

    if (selectCount === 0) {
      return res.status(404).json({ message: 'Project not found to toggle archive status' });
    }

    const currentStatus = selectRows[0].is_archived;
    const newStatus = !currentStatus;

    // 2. Update to the new status
    const { rows: updateRows } = await query(updateQuery, [newStatus, id]);

    console.log(`Project ${id} archive status toggled to ${newStatus}`);
    res.status(200).json(updateRows[0]); // Return the updated project

  } catch (error) {
    console.error(`Error toggling archive status for project ID ${id}:`, error);
    res.status(500).json({ message: 'Error toggling archive status', error: error.message });
  }
}; 