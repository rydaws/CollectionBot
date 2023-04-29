const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

let user;
let deployments;
let team;

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('quest')
		.setDescription('Send your team of monsters out on a quest!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('status')
				.setDescription('View your current quest\'s status'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('start')
				.setDescription('Set out on your quest with your current team.')),
	async execute(interaction) {
		// User who "owns" this embed
		user = interaction.user;

		const client = new Client(con);
		await client.connect();

		try {
			let query = `SELECT * FROM deployments WHERE client_id = ${user.id};`;
			deployments = await client.query(query);

			query = `SELECT active FROM box WHERE client_id = ${user.id} AND active = true;`;
			team = await client.query(query);

		}
		catch (error) {
			console.log('quest SQL error');
		}

		const teamSize = Object.keys(team.rows).length;

		if (teamSize === 0) {
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`Your team is empty! Use ${Commands.team[0]} to add members to your team.`))] });
			console.log(`[Quest | ERROR] - ${user.username}'s team is empty, could not access quest data`);
			return;
		}


		const chosenSubcommand = interaction.options.getSubcommand();

		switch (chosenSubcommand) {

		case 'status':

			if (Object.keys(deployments.rows).length === 0) {
				await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`You have no active quests! Use ${Commands.quest[1]} to set out on a quest!`))] });
				console.log(`[Quest] - ${user.username} has no active quest.`);

				return;
			}

			await questStatus(interaction);

			break;

		case 'start':
			await questStart(interaction);
			break;

		}

	},
};

async function questStatus(interaction) {
	const startTime = deployments.rows[0].start_at;
	const endTime = deployments.rows[0].end_at;


}

async function questStart(interaction) {
	const date = new Date();
	console.log('Date ', date.getDate());
	console.log('Time ', date.getTime());

}