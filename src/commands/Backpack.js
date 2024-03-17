const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
const { con } = require('../util/QueryUtil');
const { getAllItems } = require('../items/ItemList');

// Global variables
let user;

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('backpack')
		.setDescription('View what items you have in your backpack'),
	async execute(interaction) {
		// User from interaction
		user = interaction.user;

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {
			// Gets client's backpack contents
			const backpack = await client.query(`SELECT * FROM backpack WHERE client_id = ${user.id}`);

			await interaction.reply({ embeds: [backpackEmbed(backpack)] });
		}
		catch (e) {
			console.log(`[Backpack | ERROR] Could not fetch Backpack of user ${user.username}`);
		}
		client.destroy();
	},
};

/**
 * Constructs embed to display user's backpack items and their currency.
 *
 * @param {JSON} backpack - The contents of backpack from DB for user
 * @returns {EmbedBuilder} - Embed object
 */
function backpackEmbed(backpack) {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${user.username}'s Backpack`, iconURL: user.avatarURL() })
		.setDescription('**Contents:**')
		.setTimestamp();

	// Array to display onto fields
	const col = [];

	// Currency from DB
	const shmoins = backpack.rows[0].shmoins;
	col.push(`**${user.username}'s Shmoins:** ${shmoins}\n\n`);

	// ALl potential items that can be in a backpack
	const allItems = getAllItems();

	// Constructs display for each item
	allItems.forEach((item) => col.push(`${item.emoji} \`${item.bigName} ${addWhitespace(item, backpack.rows[0][item.name])} Quantity: ${backpack.rows[0][item.name]}\`\n`));

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

/**
 * Adds whitespace to lines.
 *
 * Adaptively adds whitespace to make all lines exactly the same length for display.
 *
 * @param {Object} item - The current item
 * @param {int} quantity - Quantity of the item in the backpack
 * @returns {string} - String of whitespace
 */
function addWhitespace(item, quantity) {
	const max = 30;

	// Length of current items
	const entire = 1 + item.bigName.length + 'Quantity'.length + quantity.toString().length;

	// Amount of whitespace to add
	const length = max - entire;

	let whitespace = '';
	for (let i = 0; i < length; i++) {
		whitespace = whitespace + ' ';
	}

	return whitespace;
}