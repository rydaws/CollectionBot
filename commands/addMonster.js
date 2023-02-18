const { SlashCommandBuilder } = require('discord.js');
const { con } = require('../db');
const { Client } = require('pg');

let res;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addmonster')
		.setDescription('Adds monster to your box')
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
			await client.query(`INSERT INTO box VALUES (${client_id}, ${monster_id}, 1)`);
			res = await client.query(`SELECT * FROM monsters WHERE id = ${monster_id}`);
			console.log(res);

			const monster_name = res.rows[0].display_name;

			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			await interaction.reply(`Added ${monster_name} to your box`);
		}
		catch (error) {
			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			console.log('FAILED');
			await interaction.reply('That monster does not exist or you already own it!');
		}

		client.end();

	},
};