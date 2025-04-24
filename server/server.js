import dotenv from 'dotenv';
dotenv.config(); // Load .env variables first

import express from 'express';
import cors from 'cors';
import projectRoutes from './src/routes/projectRoutes.js'; // Import project routes
// Remove import for deleted activity routes
// import activityRoutes from './src/routes/activityRoutes.js'; 
import pool from './db/index.js'; // Import pool to initialize connection

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get('/api/health', (req, res) => {
  // Optional: Check DB connection health too
  pool.query('SELECT 1')
    .then(() => res.status(200).json({ status: 'UP', message: 'Server and DB connection are healthy' }))
    .catch(err => res.status(500).json({ status: 'DOWN', message: 'Server is UP, but DB connection failed', error: err.message }));
});

// API routes
app.use('/api/projects', projectRoutes);
// Remove activity routes
// app.use('/api/activity', activityRoutes); 

// Placeholder for future API routes
// app.use('/api/projects', projectRoutes); 

// Start server
const server = app.listen(port, () => { // Assign server to variable for graceful shutdown
  console.log(`Server listening at http://localhost:${port}`);
});

// Handle graceful shutdown (optional but good practice)
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
}); 