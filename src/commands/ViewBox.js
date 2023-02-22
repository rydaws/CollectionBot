const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonComponent } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

let res;
let user;
let size;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('box')
		.setDescription('Shows your box of monsters')
		.addStringOption(option =>
			option.setName('client_id')
				.setDescription('User\'s box you\'d like to view')),
	async execute(interaction) {
		user = interaction.user;
		let client_id = interaction.options.getString('client_id');

		if (client_id === null) {
			client_id = user.id;
		}

		const client = new Client(con);
		await client.connect();

		try {
			res = await client.query(`SELECT box.client_id, box.id, box.level, monsters.display_name from box INNER JOIN monsters ON box.id = monsters.id WHERE client_id = ${client_id} ORDER BY box.id`);

			size = Object.keys(res.rows).length;

			await interaction.reply({ embeds: [createEmbed()], components: [createButtons()] });
		}
		catch (error) {
			console.log(`[ViewBox | ERROR] Client ${client_id} does not own any monsters `);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You do not own any monsters yet! Do ${Commands.show}`))] });
		}

		client.end();

	},
};

function createEmbed() {
	console.log('Creating embed....');

	const embed =  new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL() })
		.setDescription('**Page 1**')
		.setTimestamp()
		.setFooter({ text: 'WILL ONLY SHOW FIRST 20 MONSTERS RIGHT NOW' });

	const col1 = [];
	const col2 = [];

	// 20 entries per page, 2 rows of 10
	const pages = Math.ceil(size / 20);
	console.log(`Pages: ${pages}`);

	if (pages <= 1) {
		res.rows.forEach((mon) => col1.push(`\`${mon.id}\` ${mon.display_name}\n`));
		embed.addFields({ name: ' ', value: `${col1.join('')}`, inline: true });
	}
	else {
		let i = 0;
		res.rows.forEach((mon) => {
			if (i < 10) {
				col1.push(`\`${mon.id}\` ${mon.display_name}\n`);
			}
			else if (i < 20) {
				col2.push(`\`${mon.id}\` ${mon.display_name}\n`);
			}
			else {
				// TODO NEXT PAGE
			}
			i++;
		});
		embed.addFields({ name: ' ', value: `${col1.join('')}`, inline: true });
		embed.addFields({ name: ' ', value: `${col2.join('')}`, inline: true });

	}
	return embed;
}

function createButtons() {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonComponent()
				.setCustomId('next')
				.setLabel('Next')
				.setStyle(1)
				.setEmoji('1077754371720368138'),
		);
}