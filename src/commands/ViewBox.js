const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

// Global variables
let res;
let user;
let ownerId;
let size;
let monsterCache = [];
let currentPage;
let column = [];
let pages;

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('box')
		.setDescription('Shows your box of monsters')
		// TODO make user option
		.addStringOption(option =>
			option.setName('client_id')
				.setDescription('User\'s box you\'d like to view')),

	async execute(interaction) {
		monsterCache = [];
		column = [];
		user = interaction.user;
		ownerId = user.id;
		let client_id = interaction.options.getString('client_id');

		// Sets client_id if no option is passed into command
		if (client_id === null) {
			client_id = user.id;
		}

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {
			// Gathers owned monsters data
			res = await client.query(`SELECT box.client_id, box.id, box.level, monsters.display_name from box INNER JOIN monsters ON box.id = monsters.id WHERE client_id = ${client_id} ORDER BY box.id`);

			// Amount of monsters in JSON object
			size = Object.keys(res.rows).length;

			await interaction.reply({ embeds: [createEmbed()], components: [createButtons()] });
		}
		catch (error) {
			console.log(`[ViewBox | ERROR] Client ${client_id} does not own any monsters `);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You do not own any monsters yet! Do ${Commands.show}`))] });
		}

		// Closes SQL connection
		client.end();

	},
	/**
	 * Next page of box.
	 *
	 * The next page is fetched once the next page button is pressed.
	 *
	 * @param interaction - The embed to edit
	 * @returns {Promise<void>} - Fills embed before displaying (Will have undefined objects otherwise)
	 */
	async nextPage(interaction) {

		// Check to make sure only the box owner can navigate embed
		if (interaction.user.id !== ownerId) {
			console.log(`[ViewBox | ERROR] Button client: ${interaction.user.id} does not equal embed client: ${ownerId}`);
			return;
		}
		// Increases page number
		currentPage++;

		// Checks page bounds
		if (currentPage > pages) {
			console.log(`[ViewBox | ERROR] Page ${currentPage} does not exist within pages ${pages} for client: ${user.username}`);
			await interaction.update({
				content: 'That page doesn\'t exist!',
			});
			// If out of bounds, revert page count increase
			currentPage--;
			return;
		}
		// The next page embed with info
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
	/**
	 * Previous page of box.
	 *
	 * The previous page is fetched once the last page button is pressed.
	 *
	 * @param interaction - The embed to edit
	 * @returns {Promise<void>} - Fills embed before displaying (Will have undefined objects otherwise)
	 */
	async lastPage(interaction) {

		// Checks page bounds (There is no Page 0)
		if (currentPage === 1) {
			console.log(`[ViewBox | ERROR] Page ${currentPage - 1} does not exist for client: ${user.username}`);
			await interaction.update({
				content: 'That page doesn\'t exist!',
			});
			return;
		}

		// Decreases page amount
		currentPage--;

		// The previous page embed with info
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

/**
 * Creates box embed
 *
 * @returns {EmbedBuilder} - Box embed to display
 */
function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL() })
		.setDescription('**Page 1**')
		.setTimestamp();

	// Sets current page to 1
	currentPage = 1;

	// Determines how many pages there will be. 20 monsters per page.
	pages = Math.ceil(size / 20);
	console.log(`[ViewBox] Embed for ${user.username}'s box has ${pages} pages`);
	embed.setFooter({ text: `Page 1/${pages}` });

	if (size <= 10) {
		const col1 = [];
		res.rows.forEach((mon) => col1.push(`\`${mon.id}\` ${mon.display_name}\n`));
		embed.addFields({ name: ' ', value: `${col1.join('')}`, inline: true });
	}
	else {
		let i = 0;

		// Adds 10 monsters to first column and next 10 to second column
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

/**
 * Creates embed that has navigation buttons to change pages.
 *
 * @returns {ActionRowBuilder<AnyComponentBuilder>} - Embed with navigation buttons
 */
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
