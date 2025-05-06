const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    //connectionString: process.env.DATABASE_URL, // Use the database URL from environment variables
    ssl: {
      rejectUnauthorized: false, // Required for Heroku Postgres to allow self-signed certificates
    },
    //added
    user: process.env.D2B_USER,
    host: process.env.D2B_HOST,
    database: process.env.D2B_NAME,
    password: process.env.D2B_PASSWORD,
    port: process.env.D2B_PORT,
    //added
    max: 5, // set connection limit to 20
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection to be established
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10, // set connection limit to 10
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection to be established
  });
}

module.exports = pool;
