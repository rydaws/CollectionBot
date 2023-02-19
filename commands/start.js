const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Creates profile for user'),
	async execute(interaction) {
		const id = interaction.user.id;


		const client = new Client(con);
		await client.connect();

		try {
			// TODO this logic doesnt work, reversed. We want to check if they already exist and stop further queries.
			// try {
			// 	await client.query(`SELECT * FROM player WHERE client_id = ${id}`);
			// }
			// catch (e) {
			// 	console.log(`[Start | ERROR] Profile already exists for ${id}`);
			// }
			console.log(`[Start] Adding if not exists ${id}`);
			await client.query(`INSERT INTO player VALUES (${id}, DEFAULT) ON CONFLICT (client_id) DO NOTHING`);

			// TODO Will have to update inventory at this point!

			console.log(`[Start] Created profile for ${interaction.user.username}`);
			await interaction.reply({ embeds: [new EmbedBuilder(textEmbed('Profile successfully created! Do /catch to start your journey.'))] });

		}
		catch (error) {
			console.log(`[Start | ERROR] Profile could not be created for ${id}`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Something went wrong, profile not created. Contact staff!'))] });

		}


		client.end();

	},
};