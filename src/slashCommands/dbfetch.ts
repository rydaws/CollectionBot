import { User, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../types";
import { Client } from "pg";
import con from "../util/QueryUtil";
import { errorEmbed } from "../util/EmbedUtil";
import { fetchMonsterDetails } from "../monsters/MonsterDetails";


// Global variables
let res;
let user: User;
let name: string;
let className: string;
let type: string;
let rarity: string;
let img: string;

// Incoming SlashCommand
const dbfetchCommand: SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('Fetch monster from db by id')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The id of the monster')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	execute: async interaction => {
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
			await interaction.reply({ embeds: [(errorEmbed('Could not fetch monster with that ID!'))] });
		}

		// Close SQL connection
		await client.end()
	},
};

/**
 * Creates monster embed.
 *
 * @returns {EmbedBuilder} - The embed to be displayed
 */
function createEmbed() {
	return new EmbedBuilder()
		.setColor(fetchMonsterDetails(rarity)?.color || 0x333333)
		.setTitle('Queried Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL()! })
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

export default dbfetchCommand