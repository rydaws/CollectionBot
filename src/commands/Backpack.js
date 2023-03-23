const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
const { con } = require('../util/QueryUtil');
const { getAllItems } = require('../shop/ItemList');
const capitalize = require('../util/StringUtil');

let user;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('backpack')
		.setDescription('View what items you have in your backpack'),
	async execute(interaction) {
		user = interaction.user;

		const client = new Client(con);
		await client.connect();

		try {
			const backpack = await client.query(`SELECT * FROM backpack WHERE client_id = ${user.id}`);

			await interaction.reply({ embeds: [backpackEmbed(backpack)] });
		}
		catch (e) {
			console.log(`[Backpack | ERROR] Could not fetch Backpack of user ${user.username}`);
		}
	},
};

function backpackEmbed(backpack) {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${user.username}'s Backpack`, iconURL: user.avatarURL() })
		.setDescription('**Contents:**')
		.setTimestamp();

	const col = [];

	const allItems = getAllItems();

	allItems.forEach((item) => col.push(`${item.emoji} \`${capitalize(item.name)} ${addWhitespace(item)} Quantity: ${backpack.rows[0][item]}\`\n`));

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

function addWhitespace(item) {
	const max = 30;

	// Length of current items
	const entire = 1 + item.name.length + item.price.toString().length + 'Quantity'.length;

	// Amount of whitespace to add
	const length = max - entire;

	let whitespace = '';
	for (let i = 0; i < length; i++) {
		whitespace = whitespace + ' ';
	}

	return whitespace;
}