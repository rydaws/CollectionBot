const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const itemList = require('../shop/ItemList');
const capitalize = require('../util/StringUtil');
const { errorEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');


let user;
let backpack;

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

		const client = new Client(con);
		await client.connect();

		if (interaction.options.getSubcommand() === 'view') {
			try {
				await interaction.reply({ embeds: [createEmbed()] });
			}
			catch (error) {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Shop Error! Please contact staff!'))] });

			}

		}

		client.end();

	},

};

function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: 'Shop', iconURL: user.avatarURL() })
		.setDescription('**View my wares...**')
		.setTimestamp();

	const col = [];

	col.push('═════════ Catching ═════════\n');
	itemList.forEach((item) => col.push(`\`${item.id}\` ${item.emoji} \`${capitalize(item.name)} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

function addWhitespace(item) {
	const max = 30;

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
