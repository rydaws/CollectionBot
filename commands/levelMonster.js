const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');

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

			console.log(`[LevelMonster] Increased monster with with ID ${monster_id} to ${level}.`);
			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			await interaction.reply(`Increased level for ${monster_id} to ${level}`);
		}
		catch (error) {
			console.log(`[LevelMonster | ERROR] Client ${client_id} does not own monster ID ${monster_id}.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('You do not own that monster'))] });

		}

		client.end();

	},
};