const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../util/EmbedUtil');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { Commands } = require('../CommandList');

let user;
let size;
let box;
let dbteam;
let returned;
let team = [];

const TEAM_SIZE = 4;

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
				.addStringOption(name =>
					name.setName('name')
						.setDescription('Name of monster to add to your team')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove monsters from your team')
				.addStringOption(name =>
					name.setName('name')
						.setDescription('Name of monster to remove from your team')
						.setRequired(true))),
	async execute(interaction) {
		// User who "owns" this embed
		user = interaction.user;

		const targetName = interaction.options.getString('name');

		// Discord.js check for if embed was already returned
		returned = false;

		// SQL connection
		const client = new Client(con);
		await client.connect();

		const getDB = `SELECT box.client_id, box.id, box.level, box.xp, box.xp_required, box.active, monsters.display_name from box INNER JOIN monsters ON box.id = monsters.id WHERE client_id = ${user.id} AND active = true ORDER BY box.id;`;

		try {
			const query = `SELECT box.id, monsters.display_name FROM box INNER JOIN monsters ON box.id = monsters.id WHERE client_id = ${user.id};`;
			dbteam = await client.query(query);

			box = await client.query(getDB);
		}
		catch (error) {
			if (returned === false) {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`Try ${Commands.start} and if issue persists, contact staff.`))] });
				returned = true;
			}
		}

		size = Object.keys(box.rows).length;

		const chosenSubcommand = interaction.options.getSubcommand();

		team = [];
		// Saves active team to array
		box.rows.forEach((member) => {
			team.push(member.display_name);
		});

		let status;

		switch (chosenSubcommand) {

		case 'add':
			status = await addMember(interaction, targetName);
			break;

		case 'remove':
			status = await removeMember(interaction, targetName);
			break;
		}

		if (chosenSubcommand !== 'view') {
			try {
				const query = `UPDATE box SET active = ${status} WHERE client_id = ${user.id} AND id = (SELECT id FROM monsters WHERE display_name = '${targetName}');`;
				await client.query(query);

				box = await client.query(getDB);
			}
			catch (error) {
				if (returned === false) {
					await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Could not save your team! Contact staff!'))] });
					returned = true;
					console.log(`[Team | ERROR - Could not save team to ${user.username}'s box!]`);
				}
			}
		}
		else {
			console.log(`[Team] - Viewing ${user.username}'s active team.`);
		}

		if (returned === false) {
			await interaction.reply({ embeds: [await createEmbed()] });
		}

		client.destroy();
	},
};

async function addMember(interaction, targetName) {

	// Checks to see if their team of TEAM_SIZE is full
	if (size === TEAM_SIZE) {
		console.log(`[Team | ERROR] - User ${user.username}'s team is full! Cannot add another member.`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Team is full! Cannot add another member'))] });

		returned = true;
		return;
	}

	// Checks to see if user already has that monster active
	if (team.includes(targetName)) {
		console.log(`[Team | ERROR] - User ${user.username}'s team already has this member!`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('Team already has this member! Try adding a different one.'))] });

		returned = true;
		return;
	}

	let hit;

	// Checks to see if user owns monsters
	dbteam.rows.forEach((mon) => { if (mon.display_name === targetName) hit = true; });

	if (!hit) {
		console.log(`[Team | ERROR] - User ${user.username} does not own monster ${targetName}`);
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You do not own that monster or spelling is wrong, (CaSe SeNsItIvE)! View your monsters with ${Commands.box}`))] });

		returned = true;
		return;
	}

	console.log(`[Team] - Adding ${targetName} to ${user.username}'s active team.`);

	return true;

}

async function removeMember(interaction, targetName) {

	if (!team.includes(targetName)) {
		await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`Your team has no such member! Start by using ${Commands.team[0]}`))] });

		returned = true;
		return;
	}

	console.log(`[Team] - Removing ${targetName} from ${user.username}'s active team.`);
	return false;

}

async function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Your team')
		.setAuthor({ name: `${user.username}'s team`, iconURL: user.avatarURL() })
		.setTimestamp();

	const col = [];

	box.rows.forEach((member) => {
		col.push(`✅ \`${member.id}\` ${member.display_name} Lv: \`${member.level}\` XP: ${member.xp}/${member.xp_required}\n`);
	});

	size = Object.keys(box.rows).length;

	const upper = TEAM_SIZE - size;

	for (let i = 0; i < upper; i++) {
		col.push('❌ Slot empty!\n');
	}

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}

