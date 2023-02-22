const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { monsterEmbed, errorEmbed } = require('../util/EmbedUtil');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');


let res;
let size;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('catch')
		.setDescription('Encounter a monster and attempt to capture it!'),
	async execute(interaction) {
		const client_id = interaction.user.id;

		const client = new Client(con);
		await client.connect();

		try {
			res = await client.query(`SELECT id from monsters WHERE id not in (SELECT id from box where client_id=${client_id})`);
			size = Object.keys(res.rows).length;

			if (size === 0) {
				console.log(`[Catch | ERROR] Client ${client_id} owns all monsters.`);
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('You already own all of the monsters! Focus on training them'))] });
				return;
			}

			const roll_id = res.rows[Math.floor(Math.random() * (size))].id;

			await client.query(`INSERT INTO box VALUES (${client_id}, ${roll_id}, 1)`);
			console.log(`[Catch] Added ${roll_id} to ${interaction.user.username}'s box`);

			res = await client.query(`SELECT * FROM monsters WHERE id=${roll_id}`);

			await interaction.reply(`You captured ${res.rows[0].display_name}!`);
			await interaction.followUp({ embeds: [new EmbedBuilder(monsterEmbed(interaction.user, res))] });

		}
		catch (error) {
			console.log(`[Catch | ERROR] Failed to catch monster for ${client_id}.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Error! Please contact staff if this issue persists'))] });
		}

		client.end();

	},

};
