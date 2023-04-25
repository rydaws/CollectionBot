const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { Commands } = require('../CommandList');
const { fetchMonsterDetails } = require('../monsters/MonsterDetails');

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
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`Try ${Commands.start} and if issue persists, contact staff.`))] });
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
		}

		client.end();
	},
};

async function viewTeam(interaction) {
	console.log('[TEAM] - Viewing team...');
	await interaction.reply({ embeds: [createEmbed()] });

}

async function addMember(interaction) {
	console.log('Adding member to team');

	const monster_id = interaction.options.getInteger('monster_id');

	if (!team.includes(null)) {
		console.log(`[Team | ERROR] - User ${user.username}'s team is full! Cannot add another member.`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Team is full! Cannot add another member'))] });

		return true;
	}

	let hit;
	box.rows.forEach((mon) => { if (mon.id === monster_id) hit = true; });

	if (!hit) {
		console.log(`[Team | ERROR] - User ${user.username} does not own monster ${monster_id}`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You do not own that monster! View your monsters with ${Commands.box}`))] });

		return true;
	}

	const index = team.findIndex((member) => member === null);

	team[index] = monster_id;

	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`TEAM UPDATED: Slot 1: ${team[0]} Slot 2: ${team[1]} Slot 3: ${team[2]} Slot 4: ${team[3]}`))] });


}

async function removeMember(interaction) {
	console.log('Removing member from team');

	const slot_id = interaction.options.getInteger('slot_id') - 1;

	if (slot_id > 4) {
		console.log('no slot with that ID');
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`Slot ${slot_id} doesn't exist! You can only have 4 members on your team.`))] });
		return;
	}

	if (team[slot_id] === null) {
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`Your team has no member! Start by using ${Commands.team[0]}`))] });
		return;
	}

	team[slot_id] = null;

	const newArray = [];

	team.forEach((member) => {if (member !== null) newArray.push(member); });

	const upper = 4 - newArray.length;

	for (let i = 0; i < upper; i++) {
		newArray.push(null);
		console.log('I is: ', i);
	}

	team = newArray;

	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`TEAM UPDATED: Slot 1: ${team[0]} Slot 2: ${team[1]} Slot 3: ${team[2]} Slot 4: ${team[3]}`))] });

}

function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('m')
		.setAuthor({ name: `${user.username}'s team`, iconURL: user.avatarURL() })
		.setDescription('Your team')
		.setTimestamp();

	const col = [];

	const details = getMemberDetails();
	team.forEach((member) => {
		if (member != null) {
			col.push(`✅ ${details.rows[0].display_name} Lv: \`${details.rows[0].level}\``);
		}
		else {
			col.push('❌ Slot empty!');
		}
	});

	embed.addFields({ name: ' ', value: `${col[0].join('')}`, inline: true });

	return embed;
}

async function getMemberDetails(interaction) {
	const query = `SELECT team.client_id, team.slot_1, team.slot_2, team.slot_3, team.slot_4, box.id, box.level, monsters.display_name 
FROM team 
INNER JOIN box ON team.client_id  = box.client_id 
INNER JOIN monsters ON monsters.id = box.id 
WHERE team.client_id = ${user.id} AND (team.slot_1 = box.id OR team.slot_2 = box.id OR team.slot_3 = box.id OR team.slot_4 = box.id)`

	// SQL connection
	const client = new Client(con);
	await client.connect();

	try {
		return await client.query(query);
	}
	catch (error) {
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Could not fetch your box and team! Contact staff.'))] });

	}


}
