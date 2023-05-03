const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

let user;
let deployments;
let team;
let col = [];

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
			let query = `SELECT start_time, end_time,
							  CASE 
								WHEN end_time < NOW() THEN 'Ended' 
								ELSE CONCAT(EXTRACT(epoch FROM (end_time - NOW()))/3600)
							  END AS status
							FROM deployments
							WHERE client_id = ${user.id};`;
			deployments = await client.query(query);

			query = `SELECT box.id, box.level, box.active, box.xp, monsters.display_name 
						FROM box 
						INNER JOIN monsters 
						ON box.id = monsters.id 
						WHERE client_id = ${user.id}
						AND active = true;`;
			team = await client.query(query);

		}
		catch (error) {
			console.log('quest SQL error');
		}

		let ended = false;
		col = [];
		console.log('Col length after wipe ', col.length);
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
			console.log('Ended before func call', ended);
			ended = await questStatus(interaction);
			console.log('Ended before if', ended);

			if (ended) {

				try {

					// Delete record from this deployment
					const query = `DELETE FROM deployments WHERE client_id = ${user.id};`;
					await client.query(query);
				}
				catch (error) {
					console.log('delete up error');
				}

			}

			break;

		case 'start':

			if (Object.keys(deployments.rows).length === 0) {
				await questStart(interaction);
			}
			else {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You can only have 1 active quest! Check your current quest status with ${Commands.quest[0]}.`))] });
			}

			break;

		}
		client.end();

	},
};

async function questStatus(interaction) {
	const isQuestActive = deployments.rows[0].status;

	// Random XP between 50 and 150 ((Max - Min + 1) + min)
	const experienceToGive = Math.floor(Math.random() * (150 - 50 + 1) + 50);

	if (isQuestActive === 'Ended') {
		await team.rows.forEach((monster) => gainExperience(interaction, monster.id, monster.display_name, monster.level, monster.xp, experienceToGive).then(async () => {
			// TODO DEBUG REMOVE
			console.log('Col length before calling embed ', col.length);
			await interaction.reply({ embeds: [createEmbed()] });

		}));


		return true;
	}
	else {
		await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`You have a quest active that has ${Math.round(10 * isQuestActive) / 10} hours left.`))] });

		return false;
	}

}

async function questStart(interaction) {

	const client = new Client(con);
	await client.connect();


	try {
		team.rows.forEach((member) => {
			client.query(`INSERT INTO deployments (client_id, id, start_time, end_time)
						VALUES (${user.id}, ${member.id}, NOW(), NOW() + INTERVAL '2 minutes');`);
		});
	}
	catch (error) {
		console.log('start error');
		return;
	}

	// TODO add 'Quest started!'

	console.log('quest successfully started');
	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed('started quest'))] });

	client.end();

}

async function levelUp(interaction, monster_id, monster_name, currentLevel) {

	currentLevel++;
	const experienceRequired = calculateExperienceRequired(currentLevel);
	// await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Congratulations! Your Monster has reached level ${currentLevel}. They need ${experienceRequired} experience to reach the next level.`))] });

	console.log(`Congratulations! Your Monster has reached level ${currentLevel}. They need ${experienceRequired} experience to reach the next level.`);

	const client = new Client(con);
	await client.connect();

	try {
		// Update monster level and reset experience points
		const query = `UPDATE box SET level = ${currentLevel}, xp = 0 WHERE client_id = ${user.id} AND id = ${monster_id} AND active = true;`;
		await client.query(query);

	}
	catch (error) {
		console.log('level up error');
	}

	col.push(`⏫ ${monster_name} has leveled up to \`${currentLevel}\`!`);
	console.log('Col length after levelUp push ', col.length);

	client.end();

}

async function gainExperience(interaction, monster_id, monster_name, currentLevel, currentExperience, amount) {
	currentExperience += amount;
	const experienceRequired = calculateExperienceRequired(currentLevel);
	if (currentExperience >= experienceRequired) {
		await levelUp(interaction, monster_id, monster_name, currentLevel);
	}
	else {

		const client = new Client(con);
		await client.connect();

		try {
			const query = `UPDATE box SET xp = ${currentExperience} WHERE client_id = ${user.id} AND id = ${monster_id} AND active = true;;`;
			await client.query(query);

		}
		catch (error) {
			console.log('gain experience error');
		}

		col.push(`🔼 ${monster_name} has gained \`${amount}\` XP!`);
		console.log('Col length after XP push ', col.length);

		client.end();
	}

}

function calculateExperienceRequired(currentLevel) {
	return currentLevel * currentLevel * 100;
}

function createEmbed() {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Quest results')
		.setAuthor({ name: `${user.username}'s team`, iconURL: user.avatarURL() })
		.setTimestamp();

	embed.addFields({ name: ' ', value: `${col.join('')}`, inline: true });

	return embed;
}
