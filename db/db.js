const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Admin@123',
  port: 5432, // default PostgreSQL port
});

// Event listener for when a client is connected to the pool
pool.on('connect', () => {
  console.log('PostgreSQL database connected!');
});

// Event listener for when an error occurs during the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1); // Exit the process due to the error
});

// Export the pool for use in other modules
module.exports = pool;
