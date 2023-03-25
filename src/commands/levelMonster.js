const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');

// Global variables
let res;
let level;

// TODO move to staff commands

// Incoming SlashCommand
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

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {

			// TODO this might be able to be condensed into one line. Select and update at same time, reduce by 1 if needed
			// Gets current level of monster from user's box
			res = await client.query(`SELECT level FROM box WHERE client_id=${client_id} AND id=${monster_id}`);

			// Increases user's monster by 1
			level = res.rows[0].level + 1;
			await client.query(`UPDATE box SET level = ${level} WHERE client_id = ${client_id} AND id = ${monster_id}`);

			console.log(`[LevelMonster] Increased monster with with ID ${monster_id} to ${level}.`);
			await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Increased level for ${monster_id} to ${level}`))] });

		}
		catch (error) {
			console.log(`[LevelMonster | ERROR] Client ${client_id} does not own monster ID ${monster_id}.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('You do not own that monster'))] });

		}

		// Closes SQL connection
		client.end();

	},
};