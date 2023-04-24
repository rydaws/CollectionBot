const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { Commands } = require('../CommandList');

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

		team = [];

		// Fills team from DB into array
		team.push(dbteam.rows[0].slot_1, dbteam.rows[0].slot_2, dbteam.rows[0].slot_3, dbteam.rows[0].slot_4);

		const chosenSubcommand = interaction.options.getSubcommand();

		switch (chosenSubcommand) {
		case 'view':
			await viewTeam(interaction);
			break;

		case 'add':
			await addMember(interaction);
			break;

		case 'remove':
			await removeMember(interaction);
			break;
		}

		if (chosenSubcommand !== 'view') {
			try {
				const query = `UPDATE team SET slot_1 = ${team[0]}, slot_2 = ${team[1]}, slot_3 = ${team[2]}, slot_4 = ${team[3]} WHERE client_id = ${user.id};`;
				await client.query(query);
			}
			catch (error) {
				console.log('error');
			}
			await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`TEAM UPDATED: Slot 1: ${team[0]} Slot 2: ${team[1]} Slot 3: ${team[2]} Slot 4: ${team[3]}`))] });
		}
		else {
			await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Slot 1: ${dbteam.rows[0].slot_1} Slot 2: ${dbteam.rows[0].slot_2} Slot 3: ${dbteam.rows[0].slot_3} Slot 4: ${dbteam.rows[0].slot_4}`))] });
		}

		client.end();
	},
};

async function viewTeam() {
	console.log('Viewing team...');
}

async function addMember(interaction) {
	console.log('Adding member to team');

	const monster_id = interaction.options.getInteger('monster_id');

	if (!team.includes(null)) {
		console.log(`[Team | ERROR] User ${user.username}'s team is full! Cannot add another member.`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Team is full! Cannot add another member'))] });

		return;
	}

	let hit;
	box.rows.forEach((mon) => { if (mon.id === monster_id) hit = true; });

	if (!hit) {
		console.log(`[Team | ERROR] User ${user.username} does not own monster ${monster_id}`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You do not own that monster! View your monsters with ${Commands.box}`))] });

		return;
	}

	const index = team.findIndex((member) => member === null);

	team[index] = monster_id;

}

async function removeMember(interaction) {
	console.log('Removing member from team');

	const slot_id = interaction.options.getInteger('slot_id') - 1;

	if (slot_id > 4) {
		console.log('no slot with that ID');
		return;
	}

	if (team[slot_id] === null) return;

	team[slot_id] = null;

	const newArray = [];

	team.forEach((member) => {if (member !== null) newArray.push(member); });

	// TODO DEBUG REMOVE
	console.log(`TEAM SIZE ${team.length}`);
	console.log(`NEW ARRAY SIZE ${newArray.length}`);

	console.log(`ADDING ${4 - newArray.length} NULLS`);
	const upper = 4 - newArray.length;
	console.log(`UPPER BOUND: ${upper}`);
	for (let i = 0; i < upper; i++) {
		newArray.push(null);
		console.log('I is: ', i);
	}

	// TODO DEBUG REMOVE
	console.log(`NEW ARRAY FINAL ${newArray}`);
	console.log(`NEW ARRAY SIZE FINAL ${newArray.length}`);

	team = newArray;

}
