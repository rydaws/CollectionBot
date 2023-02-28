const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

let res;
let user;
let ownerId;
let size;
let monsterCache = [];
let currentPage;
let column = [];
let pages;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('box')
		.setDescription('Shows your box of monsters')
		.addStringOption(option =>
			option.setName('client_id')
				.setDescription('User\'s box you\'d like to view')),
	async execute(interaction) {
		monsterCache = [];
		column = [];
		user = interaction.user;
		ownerId = user.id;
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
	async nextPage(interaction) {

		if (interaction.user.id !== ownerId) {
			console.log(`[ViewBox | ERROR] Button client: ${interaction.user.id} does not equal embed client: ${ownerId}`);
			return;
		}
		currentPage++;

		if (currentPage > pages) {
			console.log(`[ViewBox | ERROR] Page ${currentPage} does not exist within pages ${pages} for client: ${user.username}`);
			await interaction.update({
				content: 'That page doesn\'t exist!',
			});
			currentPage--;
			return;
		}
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL() })
			.setDescription(`**Page ${currentPage}**`)
			.setTimestamp()
			.setFooter({ text: `Page ${currentPage}/${pages}` })
			.setFields({ name: ' ', value: `${monsterCache[currentPage].join('')}`, inline: true },
				{ name: ' ', value: `${monsterCache[currentPage + 1].join('')}`, inline: true });


		await interaction.update({ content: '', embeds: [embed], components: [createButtons()] });
	},

	async lastPage(interaction) {

		if (currentPage === 1) {
			console.log(`[ViewBox | ERROR] Page ${currentPage - 1} does not exist for client: ${user.username}`);
			await interaction.update({
				content: 'That page doesn\'t exist!',
			});
			return;
		}

		currentPage--;

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL() })
			.setDescription(`**Page ${currentPage}**`)
			.setTimestamp()
			.setFooter({ text: `Page ${currentPage}/${pages}` })
			.setFields({ name: ' ', value: `${monsterCache[currentPage - 1].join('')}`, inline: true },
				{ name: ' ', value: `${monsterCache[currentPage].join('')}`, inline: true });

		await interaction.update({ content: ' ', embeds: [embed], components: [createButtons()] });
	},
};

function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL() })
		.setDescription('**Page 1**')
		.setTimestamp();

	currentPage = 1;
	pages = Math.ceil(size / 20);
	console.log(`[ViewBox] Embed for ${user.username}'s box has ${pages} pages`);
	embed.setFooter({ text: `Page 1/${pages}` });

	if (pages <= 1) {
		const col1 = [];
		res.rows.forEach((mon) => col1.push(`\`${mon.id}\` ${mon.display_name}\n`));
		embed.addFields({ name: ' ', value: `${col1.join('')}`, inline: true });
	}
	else {
		let i = 0;

		res.rows.forEach((mon) => {
			if (i < 10) {
				column.push(`\`${mon.id}\` ${mon.display_name}\n`);
			}
			else {
				i = 0;
				monsterCache.push(column);
				column = [];
				column.push(`\`${mon.id}\` ${mon.display_name}\n`);
			}
			i++;
		});
		monsterCache.push(column);

		embed.addFields({ name: ' ', value: `${monsterCache[0].join('')}`, inline: true });
		embed.addFields({ name: ' ', value: `${monsterCache[1].join('')}`, inline: true });

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
