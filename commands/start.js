const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../db');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Creates profile for user'),
	async execute(interaction) {
		const id = interaction.user.id;


		const client = new Client(con);
		await client.connect();

		try {
			console.log(`[Start] Adding if not exists ${id}`);
			await client.query(`INSERT INTO player VALUES (${id}, DEFAULT) ON CONFLICT (client_id) DO NOTHING`);

			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			await interaction.reply(`Created profile for ${interaction.user.username}`);
		}
		catch (error) {
			console.log(`[Start | ERROR] Profile could not be created for ${id}`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Something went wrong, profile not created. Contact staff!'))] });

		}


		client.end();

	},
};