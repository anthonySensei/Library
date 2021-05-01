import { config } from 'dotenv';

config();

const Pool = require('pg').Pool;

const { DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_PORT } = process.env;

const pool = new Pool({
    user: DATABASE_USER,
    host: 'localhost',
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,
});

export default pool;
module.exports = pool;
