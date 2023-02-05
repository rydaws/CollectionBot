const { SlashCommandBuilder } = require('discord.js');
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let res;
let name;
let type;
let level;


module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('Fetch monster from db by id')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The id of the monster')
				.setRequired(true)),

	async execute(interaction) {
		const id = interaction.options.getInteger('id');

		await connectDb(id);
		await interaction.reply(name + type + level);
	},
};

const connectDb = async (id) => {
	try {
		const client = new Client({
			user: process.env.PGUSER,
			host: process.env.PGHOST,
			database: process.env.PGDATABASE,
			password: process.env.PGPASSWORD,
			port: process.env.PGPORT
		});

		await client.connect();
		res = await client.query(`SELECT * FROM monsters WHERE id=${id}`);
		name = res.rows[0].display_name;
		type = res.rows[0].type;
		level = res.rows[0].level;
		console.log(res);
		console.log('Returning display name: ' + name);
		console.log('Returning type: ' + type);
		console.log('Returning level: ' + level);
		await client.end();
	}
	catch (error) {
		console.log(error);
	}
};
