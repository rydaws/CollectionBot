const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');

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

			const monster_name = res.rows[0].display_name;

			console.log(`[AddMonster] Added ${monster_name} with id ${monster_id} to client ${client_id}'s box.`);
			await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Added ${monster_name} to your box`))] });

		}
		catch (error) {
			console.log(`[AddMonster | ERROR] Failed to add monster to ${client_id}'s box.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('That monster does not exist or you already own it!'))] });
		}

		client.end();

	},
};