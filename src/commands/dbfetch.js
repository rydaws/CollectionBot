const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
const { con } = require('../util/QueryUtil');
const { errorEmbed } = require('../util/EmbedUtil');
const { fetchMonsterDetails } = require('../monsters/MonsterDetails');


// Global variables
let res;
let user;
let name;
let className;
let type;
let rarity;
let img;

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('Fetch monster from db by id')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The id of the monster')
				.setRequired(true)),

	async execute(interaction) {
		// ID for monster
		const id = interaction.options.getInteger('id');
		user = interaction.user;

		// SQL connection
		const client  = new Client(con);
		await client.connect();

		try {
			// Gets monster data
			res = await client.query(`SELECT * FROM monsters WHERE id=${id}`);
			name = res.rows[0].display_name;
			className = res.rows[0].class;
			type = res.rows[0].type;
			rarity = res.rows[0].rarity;
			img = res.rows[0].img;

			console.log(`[Fetch] Retrieving monster with ID ${id} and name ${name}.`);

			await interaction.reply({ embeds: [createEmbed()] });
		}
		catch (e) {
			console.log(`[Fetch | ERROR] Failed to fetch monster with id ${id}.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Could not fetch monster with that ID!'))] });
		}

		// Close SQL connection
		await client.end();
	},
};

/**
 * Creates monster embed.
 *
 * @returns {EmbedBuilder} - The embed to be displayed
 */
function createEmbed() {
	return new EmbedBuilder()
		.setColor(fetchMonsterDetails(rarity).color)
		.setTitle('Queried Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription('Stats for the monster')
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		.setTimestamp();
}
