import express from 'express';
import { getAllProjects, createProject, getProjectById, updateProject, deleteProject, toggleArchiveStatus } from '../controllers/projectController.js'; // Import controller

const router = express.Router();

// Placeholder routes - Implementations will be in the controller

// GET /api/projects
router.get('/', getAllProjects); // Use the controller function

// POST /api/projects
router.post('/', createProject); // Use the controller function

// GET /api/projects/:id
router.get('/:id', getProjectById); // Use the controller function

// PUT /api/projects/:id
router.put('/:id', updateProject); // Add PUT route

// DELETE /api/projects/:id
router.delete('/:id', deleteProject); // Add DELETE route

// PUT /api/projects/:id/archive - Toggle archive status
router.put('/:id/archive', toggleArchiveStatus); // Add archive toggle route

export default router; 