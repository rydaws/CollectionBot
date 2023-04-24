const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');

let user;
let dbteam;
let box;
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
				.setDescription('Add monsters to your team.')
				.addIntegerOption(monster_id =>
					monster_id.setName('monster_id')
						.setDescription('ID of monster to add to your team')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove monsters from your team')
				.addIntegerOption(slot_id =>
					slot_id.setName('slot_id')
						.setDescription('Slot number of monster to remove from your team')
						.setRequired(true))),
	async execute(interaction) {
		// ID of user who "owns" this embed
		user = interaction.user;

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {
			let query = `SELECT * FROM team WHERE client_id = ${user.id};`;
			dbteam = await client.query(query);

			query = `SELECT box.client_id, box.id, box.level, monsters.display_name from box INNER JOIN monsters ON box.id = monsters.id WHERE client_id = ${user.id} ORDER BY box.id;`;
			box = await client.query(query);
		}
		catch (error) {
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Team Error! Please contact staff!'))] });
		}

		// Fills team from DB into array
		team.push(dbteam.rows[0].slot_1, dbteam.rows[0].slot_2, dbteam.rows[0].slot_3, dbteam.rows[0].slot_4);

		const chosenSubcommand = interaction.options.getSubcommand();

		switch (chosenSubcommand) {
		case 'view':
			await viewTeam(interaction);
			break;

		case 'add':
			await addMember(interaction.options.getInteger('monster_id'));
			await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`TEAM ADD: Slot 1: ${dbteam.rows[0].slot_1} Slot 2: ${dbteam.rows[0].slot_2} Slot 3: ${dbteam.rows[0].slot_3} Slot 4: ${dbteam.rows[0].slot_4}`))] });

			break;

		case 'remove':
			await removeMember(interaction.options.getInteger('slot_id'));
			break;
		}

		if (chosenSubcommand !== 'view') {
			try {
				const query = `UPDATE team SET slot_1 = ${team[0]}, slot_2 = ${team[1]}, slot_3 = ${team[2]}, slot_ 4 = ${team[3]};`;
				await client.query(query);
			}
			catch (error) {
				console.log('error');
			}
		}

		client.end();
	},
};

async function viewTeam(interaction) {
	console.log('Viewing team...');
	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Slot 1: ${dbteam.rows[0].slot_1} Slot 2: ${dbteam.rows[0].slot_2} Slot 3: ${dbteam.rows[0].slot_3} Slot 4: ${dbteam.rows[0].slot_4}`))] });

}

async function addMember(monster_id) {
	console.log('Adding member to team');

	if (!team.includes(null)) {

		console.log('[Team | ERROR] Team is full! Cannot add another member');
	}

	// do for each loop on box array to make sure you own the monster, could do this check before to prevent waste of time

	const index = team.findIndex(null);

	if (team.at(index) === null) {
		team[index] = monster_id;
	}
}

async function removeMember(slot_id) {
	console.log('Removing member from team');

	team[slot_id] = null;

	const newArray = [];

	team.forEach((member) => {if (member !== null) newArray.push(member); });

	for (let i = 0; i < newArray.length; i++) {
		newArray.push(null);
	}

	team = newArray;

}
