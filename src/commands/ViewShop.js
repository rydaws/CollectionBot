const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const capitalize = require('../util/StringUtil');
const { errorEmbed } = require('../util/EmbedUtil');
const { refreshItems } = require('../shop/ItemList');


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
				.addIntegerOption(option =>
					option.setName('item_id')
						.setDescription('ID of item to purchase')
						.setRequired(true))
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

		if (interaction.options.getSubcommand() === 'view') {
			try {
				shmoins = await client.query(`SELECT shmoins FROM backpack WHERE client_id = ${user.id}`);
				await interaction.reply({ embeds: [createEmbed(itemList)] });
			}
			catch (error) {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Shop Error! Please contact staff!'))] });

			}

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

	col.push(`**${user.username}'s Shmoins:** ${shmoins.rows[0].shmoins}\n\n`);

	// TODO make this it's own category? Easier way to enable and disable items?
	col.push('═════════ Catching ═════════\n');
	itemList.forEach((item) => col.push(`\`${item.id}\` ${item.emoji} \`${capitalize(item.name)} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

function addWhitespace(item) {
	const max = 28;

	// Length of current items
	const entire = item.id.toString().length + 1 + item.name.length + item.price.toString().length + 'Shmoins'.length;

	// Amount of whitespace to add
	const length = max - entire;

	let whitespace = '';
	for (let i = 0; i < length; i++) {
		whitespace = whitespace + ' ';
	}

	return whitespace;
}
