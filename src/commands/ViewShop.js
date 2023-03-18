const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const capitalize = require('../util/StringUtil');
const { errorEmbed } = require('../util/EmbedUtil');
const { refreshItems } = require('../shop/ItemList');
const { getTrap } = require('../shop/CatchingGear');
const { Commands } = require('../CommandList');


let user;
let shmoins;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Displays the Shop')
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('View the shop'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('buy')
				.setDescription('Purchase items from the shop')
				.addStringOption(option =>
					option.setName('item_name')
						.setDescription('Name of item to purchase')
						.setRequired(true)
						.addChoices(
							{ name: 'Mousetrap', value: 'mousetrap' },
							{ name: 'Net', value: 'net' },
							{ name: 'Lasso', value: 'lasso' },
							{ name: 'Beartrap', value: 'beartrap' },
							{ name: 'Safe', value: 'safe' },
						))
				.addIntegerOption(quantity =>
					quantity.setName('quantity')
						.setDescription('Quantity of item')
						.setRequired(true))),

	async execute(interaction) {
		user = interaction.user;

		// Refreshes item list
		const itemList = refreshItems();

		const client = new Client(con);
		await client.connect();

		try {
			const res = await client.query(`SELECT shmoins FROM backpack WHERE client_id = ${user.id}`);
			shmoins = res.rows[0].shmoins;
		}
		catch (error) {
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Shop Error! Please contact staff!'))] });
		}

		if (interaction.options.getSubcommand() === 'view') {
			try {
				await interaction.reply({ embeds: [createEmbed(itemList)] });
			}
			catch (error) {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Shop Error! Please contact staff!'))] });
			}

		}

		if (interaction.options.getSubcommand() === 'buy') {
			const item_id = interaction.options.getString('item_name');
			const quantity = interaction.options.getInteger('quantity');
			const trap = getTrap(item_id);
			const price = trap.price * quantity;

			if (!trap.enabled) {
				await interaction.reply({ embeds: [errorEmbed('Item is not available for purchase at this time')] });
				console.log(`[Shop | ERROR] - Item ${trap.name} is not enabled for purchase!`);
				return;
			}

			if (price > shmoins) {
				await interaction.reply({ embeds: [failPurchase(trap, quantity, price)] });
				console.log(`[Shop | ERROR] - Client ${user.username} needs ${price - quantity} to afford ${quantity} ${trap.name}'s`);
				return;
			}

			// Adds trap(s) to player's backpack and deducts shmoins
			await client.query(`UPDATE backpack SET ${trap.name} = (SELECT ${trap.name} FROM backpack WHERE client_id = ${user.id}) + ${quantity}, shmoins = (SELECT shmoins FROM backpack WHERE client_id = ${user.id}) - ${price} WHERE client_id = ${user.id}`);
			console.log(`[Shop] - Added 1 ${trap.name} from client ${user.username}`);
			console.log(`[Shop] - Deducted ${price} to client ${user.username}`);

			await interaction.reply({ embeds: [successPurchase(trap, quantity, price)] });

		}

		client.end();

	},

};

function createEmbed(itemList) {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: 'Shop', iconURL: user.avatarURL() })
		.setDescription('**View my wares...**')
		.setTimestamp();

	const col = [];

	col.push(`**${user.username}'s Shmoins:** ${shmoins}\n\n`);

	// TODO make this it's own category? Easier way to enable and disable items?
	col.push('═════════ Catching ═════════\n');
	itemList.forEach((item) => col.push(`${item.emoji} \`${capitalize(item.name)} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

function successPurchase(trap, quantity, price) {

	return new EmbedBuilder()
		.setColor(0x32CD32)
		.setAuthor({ name: 'Purchase success!', iconURL: 'https://collection-monsters.s3.amazonaws.com/success.png' })
		.setDescription(`You purchased **${quantity} ${trap.emoji}${capitalize(trap.name)}**(s) for \`${price}\` Shmoins!`);
}

function failPurchase(trap, quantity, price) {

	return new EmbedBuilder()
		.setColor(0xFE514E)
		.setAuthor({ name: 'Purchase failed!' })
		.setDescription(`You cannot afford **${quantity} ${trap.emoji}${capitalize(trap.name)}**(s)! You need \`${price - shmoins}\` more Shmoins!\n\nDo ${Commands.catch} to earn more Shmoins!`);

}

function addWhitespace(item) {
	const max = 30;

	// Length of current items
	const entire = 1 + item.name.length + item.price.toString().length + 'Shmoins'.length;

	// Amount of whitespace to add
	const length = max - entire;

	let whitespace = '';
	for (let i = 0; i < length; i++) {
		whitespace = whitespace + ' ';
	}

	return whitespace;
}
