const { SlashCommandBuilder } = require('discord.js');
const { con } = require('../db');
const { Client } = require('pg');

let res;
let level;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uplevel')
		.setDescription('Bumps specified monster level by 1')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The id of the monster')
				.setRequired(true)),
	async execute(interaction) {
		const client_id = interaction.user.id;
		const monster_id = interaction.options.getInteger('id');

		const client = new Client(con);
		await client.connect();

		try {
			res = await client.query(`SELECT level FROM box WHERE client_id=${client_id} AND id=${monster_id}`);
			level = res.rows[0].level + 1;
			await client.query(`UPDATE box SET level = ${level} WHERE client_id = ${client_id} AND id = ${monster_id}`);
			res = await client.query(`SELECT level FROM box WHERE client_id = ${client_id} AND id = ${monster_id}`);
		}
		catch (error) {
			console.log('FAILED');
			await interaction.reply('You do not own that monster');
		}

		level = res.rows[0].level;
		console.log(level);
		await interaction.reply(`Increased level for ${monster_id} to ${res.rows[0].level}`);
		client.end();

	},
};