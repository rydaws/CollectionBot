/* eslint-disable */
import { Client } from "pg";

// Use this when making a query
const con = new Client({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT as unknown as number
});
export default con;

