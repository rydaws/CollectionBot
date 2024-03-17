const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed } = require('../util/EmbedUtil');
const { refreshItems, returnItem } = require('../items/ItemList');
const { Commands } = require('../CommandList');
const { refreshTraps } = require('../items/Traps');
const { refreshAmplifiers } = require('../items/Amplifiers');

// Global variables
let user;
let shmoins;

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Displays the Shop')
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('View the items'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('buy')
				.setDescription('Purchase items from the items')
				.addStringOption(option =>
					option.setName('item_name')
						.setDescription('Name of item to purchase')
						.setRequired(true)
						.addChoices({ name: 'Mousetrap', value: 'mousetrap' },
							{ name: 'Net', value: 'net' },
							{ name: 'Lasso', value: 'lasso' },
							{ name: 'Bearitem', value: 'bearitem' },
							{ name: 'Safe', value: 'safe' },
							{ name: 'Lucky Shmoin', value: 'luckyshmoin' },
							{ name: 'Shmoizberry', value: 'shmoizberry' }))
				.addIntegerOption(quantity =>
					quantity.setName('quantity')
						.setDescription('Quantity of item')
						.setRequired(true))),

	async execute(interaction) {
		user = interaction.user;

		// Refreshes item list
		const itemList = refreshItems();

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {
			// Gets user's Shmoins
			const res = await client.query(`SELECT shmoins FROM backpack WHERE client_id = ${user.id}`);
			shmoins = res.rows[0].shmoins;
		}
		catch (error) {
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Shop Error! Please contact staff!'))] });
		}

		// Subcommand for viewing shop
		if (interaction.options.getSubcommand() === 'view') {
			try {
				// Embed to list all shop items
				await interaction.reply({ embeds: [createEmbed(itemList)] });
			}
			catch (error) {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Shop Error! Please contact staff!'))] });
			}

		}

		// Subcommand for buying items from the shop
		if (interaction.options.getSubcommand() === 'buy') {
			// Gets parameters from command
			const item_name = interaction.options.getString('item_name');
			const quantity = interaction.options.getInteger('quantity');

			// Gets item object from the name specified
			const item = returnItem(item_name);

			const price = item.price * quantity;

			// Checks if item is enabled, otherwise deny purchase
			if (!item.enabled) {
				await interaction.reply({ embeds: [errorEmbed('Item is not available for purchase at this time')] });
				console.log(`[Shop | ERROR] - Item ${item.name} is not enabled for purchase!`);
				return;
			}

			// Checks if user can afford item, if not, deny purchase
			if (price > shmoins) {
				await interaction.reply({ embeds: [failPurchase(item, quantity, price)] });
				console.log(`[Shop | ERROR] - Client ${user.username} needs ${price - quantity} to afford ${quantity} ${item.name}'s`);
				return;
			}

			// Adds item(s) to player's backpack and deducts shmoins
			await client.query(`UPDATE backpack SET ${item.name} = (SELECT ${item.name} FROM backpack WHERE client_id = ${user.id}) + ${quantity}, shmoins = (SELECT shmoins FROM backpack WHERE client_id = ${user.id}) - ${price} WHERE client_id = ${user.id}`);
			console.log(`[Shop] - Added 1 ${item.name} from client ${user.username}`);
			console.log(`[Shop] - Deducted ${price} to client ${user.username}`);

			await interaction.reply({ embeds: [successPurchase(item, quantity, price)] });

		}

		// Close SQL connection
		client.destroy();

	},

};

/**
 * Creates shop embed with item prices.
 *
 * @returns {EmbedBuilder} - The shop embed
 */
function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: 'Shop', iconURL: user.avatarURL() })
		.setDescription('**View my wares...**')
		.setTimestamp();

	// TODO maybe we can filter instead of having this function?
	// Refreshes items to filter out disabled ones
	const trapList = refreshTraps();
	const amplifierList = refreshAmplifiers();
	const col = [];

	col.push(`**${user.username}'s Shmoins:** ${shmoins}\n\n`);

	// Section will collapse if no traps are enabled
	if (trapList.length > 0) {
		// Section header
		col.push('══════════ Traps ══════════\n');

		// Adds all catching items to embed field
		trapList.forEach((item) => col.push(`${item.emoji} \`${item.bigName} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));
	}

	// Section will collapse if no amplifiers are enabled
	if (amplifierList.length > 0) {
		// Section header
		col.push('═════════ Amplifiers ═════════\n');

		// Adds all catching items to embed field
		amplifierList.forEach((item) => col.push(`${item.emoji} \`${item.bigName} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));
	}

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

/**
 * Constructs embed of a successful purchase.
 *
 * @param {Object} item - The item purchased
 * @param {int} quantity - Quantity of item
 * @param {int} price - Price of item that was purchased
 *
 * @returns {EmbedBuilder} - The embed that is returned
 */
function successPurchase(item, quantity, price) {

	return new EmbedBuilder()
		.setColor(0x32CD32)
		.setAuthor({ name: 'Purchase success!', iconURL: 'https://collection-monsters.s3.amazonaws.com/success.png' })
		.setDescription(`You purchased **${quantity} ${item.emoji}${item.bigName}**(s) for \`${price}\` Shmoins!`);
}

/**
 * Constructs embed of a failed purchase.
 *
 * @param {Object} item - The item purchased
 * @param {int} quantity - Quantity of item
 * @param {int} price - Price of item that was purchased
 *
 * @returns {EmbedBuilder} - The embed that is returned
 */
function failPurchase(item, quantity, price) {

	return new EmbedBuilder()
		.setColor(0xFE514E)
		.setAuthor({ name: 'Purchase failed!' })
		.setDescription(`You cannot afford **${quantity} ${item.emoji}${item.bigName}**(s)! You need \`${price - shmoins}\` more Shmoins!\n\nDo ${Commands.catch} to earn more Shmoins!`);

}

/**
 * Adds whitespace to lines.
 *
 * Adaptively adds whitespace to make all lines exactly the same length for display.
 *
 * @param {Object} item - The current item
 * @returns {string} - String of whitespace
 */
function addWhitespace(item) {
	const max = 30;

	// Length of current items
	const entire = 1 + item.bigName.length + item.price.toString().length + 'Shmoins'.length;

	// Amount of whitespace to add
	const length = max - entire;

	let whitespace = '';
	for (let i = 0; i < length; i++) {
		whitespace = whitespace + ' ';
	}

	return whitespace;
}
