const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, showMonsterEmbed } = require('../util/EmbedUtil');

let res;
let res2;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Shows stats for one of your monsters.')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The id of the monster')
				.setRequired(true)),
	async execute(interaction) {
		const client_id = interaction.user.id;
		const monster_id = interaction.options.getInteger('id');

		const client = new Client(con);
		await client.connect();

		try {
			res = await client.query(`SELECT * FROM monsters WHERE id in (SELECT id FROM box WHERE client_id = ${client_id}) AND id = ${monster_id}`);
			res2 = await client.query(`SELECT level FROM box WHERE id = ${monster_id} AND client_id = ${client_id}`);
			console.log(`[ShowMonster] Displaying monster with ID ${monster_id} from client ${client_id}`);
			await interaction.reply({ embeds: [new EmbedBuilder(showMonsterEmbed(interaction.user, res, res2.rows[0].level))] });

		}
		catch (error) {
			console.log(`[ShowMonster | ERROR] Client ${client_id} does not own monster ID ${monster_id}.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('You do not own that monster'))] });
		}

		client.end();

	},
};