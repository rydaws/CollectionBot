const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const itemList = require('../shop/ItemList');


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
		const client_id = interaction.user.id;
		if (interaction.options.getSubcommand() === 'view') {
			await interaction.reply({ embeds: [createEmbed()] });

		}

		const client = new Client(con);
		await client.connect();

		try {

		}
		catch (error) {

		}

		client.end();

	},

};

function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: 'Shop' })
		.setDescription('**View my wares...**')
		.setTimestamp();

	const col = [];
	itemList.forEach((item) => {
		col.push(`\`${item.id}\` ${item.name}\n`);
	});

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

