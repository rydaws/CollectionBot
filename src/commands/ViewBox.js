const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

let res;
let user;
let size;
const map = new Map();
let monsterCache = [];
let currentPage;

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
			console.log(`Size ${size}`);
			const newPages = 30 % 10;
			console.log(`Divide ${newPages}`);

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

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL() })
		.setDescription('**Page 1**')
		.setTimestamp();

	const col1 = [];
	const col2 = [];

	currentPage = 1;
	// 20 entries per page, 2 rows of 10
	const pages = Math.ceil(size / 20);
	console.log(`Pages: ${pages}`);
	embed.setFooter({ text: `Page 1/${pages}` });

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
			monsterCache.push(`\`${mon.id}\` ${mon.display_name}\n`);
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
			new ButtonBuilder()
				.setCustomId('last_page')
				.setLabel('Back')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⬅️'),
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('next_page')
				.setLabel('Next')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('➡️'),
		);
}

module.exports = {
	// eslint-disable-next-line no-empty-function
	async updatePages(interaction) {
		// await interaction.update({ embeds: [newPages()], components: [createButtons()] });
		// await interaction.reply({ embeds: [createEmbed()], components: [createButtons()] });
		currentPage++;
		await interaction.update({
			content: `it works ${currentPage}`,
		});
	},
};

