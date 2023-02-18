const { SlashCommandBuilder } = require('discord.js');
const { con } = require('../db');
const { Client } = require('pg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Creates profile for user'),
	async execute(interaction) {
		const id = interaction.user.id;


		const client = new Client(con);
		await client.connect();

		try {
			console.log(`Adding if not exists ${id}`);
			await client.query(`INSERT INTO player VALUES (${id}, DEFAULT) ON CONFLICT (client_id) DO NOTHING`);

			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			await interaction.reply(`Created profile for ${interaction.user.username}`);
		}
		catch (error) {
			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			await interaction.reply('Something went wrong, profile not created. Contact staff!');
		}


		client.end();

	},
};