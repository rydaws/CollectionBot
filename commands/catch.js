const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { buildEmbed } = require('../displayMonster');
const { con } = require('../db');
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
				await interaction.reply('You already own all of the monsters! Focus on training them');
			}

			const roll_id = res.rows[Math.floor(Math.random() * (size))].id;

			await client.query(`INSERT INTO box VALUES (${client_id}, ${roll_id}, 1)`);
			console.log(`Added ${roll_id} to ${interaction.user.username}'s box`);

			res = await client.query(`SELECT * FROM monsters WHERE id=${roll_id}`);

			const em = new EmbedBuilder(buildEmbed(interaction.user, res));

			await interaction.reply(`You captured ${res.rows[0].display_name}!`);
			await interaction.followUp({ embeds: [em] });

			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			// TODO Also, make this call the display embed from dbfetch.js instead of the placeholder
			// await interaction.reply(`Your roll: ${roll_id}`);
		}
		catch (error) {
			// TODO Make into embed, see https://discordjs.guide/popular-topics/embeds.html#embed-preview
			await interaction.reply('Something went wrong, profile not created. Contact staff!');
		}

		client.end();

	},

};
