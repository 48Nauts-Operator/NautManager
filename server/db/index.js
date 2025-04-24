import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); 

const { Pool } = pg;

// Use environment variables for configuration
const pool = new Pool({
  user: process.env.DB_USER || 'user', // Default fallback just in case
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nautmanager_dev',
  password: process.env.DB_PASSWORD || 'password', 
  port: parseInt(process.env.DB_PORT || '5436', 10), // Ensure port is an integer
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      // Log more specific connection error
      console.error('Database connection error:', err.message);
      console.error('Check DB credentials and ensure the database container is running.');
      return; // Exit test early on error
    }
    console.log('Successfully connected to database at:', result.rows[0].now);
  });
});

// Export a query function to use the pool elsewhere
export const query = (text, params) => pool.query(text, params);

export default pool; 