const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');

let user;
let res;
let team = [];

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('team')
		.setDescription('Manage your team for quests')
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('View your current quest\'s status.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add monsters to your team.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove monsters from your team')),
	async execute(interaction) {
		// ID of user who "owns" this embed
		user = interaction.user;

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {
			const query = `SELECT * FROM team WHERE client_id = ${user.id}`;
			res = await client.query(query);
		}
		catch (error) {
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Team Error! Please contact staff!'))] });
		}

		for (const member in res.rows[0]) {
			if (member !== null) team.push(member);
		}

		console.log('Member', team);

		team = [];

		team.push(res.rows[0].slot_1, res.rows[0].slot_2, res.rows[0].slot_3, res.rows[0].slot_4);

		console.log('Member', team);

		const chosenSubcommand = interaction.options.getSubcommand();

		switch (chosenSubcommand) {
		case 'view':
			await viewTeam(interaction);
			break;

		case 'add':
			addMember();
			break;
		case 'remove':
			removeMember();
			break;
		}

		client.end();
	},
};

async function viewTeam(interaction) {
	console.log('Viewing team...');
	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Slot 1: ${res.rows[0].slot_1} Slot 2: ${res.rows[0].slot_2} Slot 3: ${res.rows[0].slot_3} Slot 4: ${res.rows[0].slot_4}`))] });

}

function addMember() {
	console.log('Adding member to team');

}

function removeMember() {
	console.log('Removing member from team');
}