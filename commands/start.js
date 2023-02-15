const { SlashCommandBuilder } = require('discord.js');
const { con } = require('../db');
const { Client } = require('pg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Creates profile for user'),
	async execute(interaction) {
		const id = interaction.user.id;
		console.log(`Adding if not exists ${id}`);

		const client = new Client(con);
		await client.connect();
		await client.query(`INSERT INTO player VALUES (${id}, DEFAULT) ON CONFLICT (client_id) DO NOTHING`);

		await interaction.reply(`Created profile for ${interaction.user.username}`);
		client.end();

	},
};