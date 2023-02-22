const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT,
});
module.exports = client;

