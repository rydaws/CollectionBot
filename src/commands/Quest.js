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
			let query = `SELECT start_time, end_time,
							  CASE 
								WHEN end_time < NOW() THEN 'Ended' 
								ELSE CONCAT(EXTRACT(epoch FROM (end_time - NOW()))/3600)
							  END AS status
							FROM deployments
							WHERE client_id = 100053570027520000;`;
			deployments = await client.query(query);

			query = `SELECT * FROM box WHERE client_id = ${user.id} AND active = true;`;
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

			if (Object.keys(deployments.rows).length === 0) {
				await questStart(interaction, teamSize);
			}
			else {
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You can only have 1 active quest! Check your current quest status with ${Commands.quest[0]}.`))] });
			}

			break;

		}

	},
};

async function questStatus(interaction) {
	const isQuestActive = deployments.rows[0].status;

	// Random XP between 50 and 150 ((Max - Min + 1) + min)
	const experienceToGive = Math.floor(Math.random() * (150 - 50 + 1) + 50);

	if (isQuestActive === 'Ended') {
		team.rows.forEach((monster) => gainExperience(interaction, monster.id, monster.level, monster.xp, experienceToGive));
		await interaction.reply({ embeds: [new EmbedBuilder(textEmbed('Adding XP'))] });

	}
	else {
		await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`You have a quest active that has ${Math.round(10 * isQuestActive) / 10} hours left.`))] });

	}
}

async function questStart(interaction, teamSize) {

	const client = new Client(con);
	await client.connect();

	try {
		for (let i = 0; i < teamSize; i++) {
			await client.query(`INSERT INTO deployments (client_id, id, start_time, end_time)
						VALUES (${user.id}, ${team.rows[i].id}, NOW() + INTERVAL '2 minutes');`);
		}
	}
	catch (error) {
		console.log('start error');
	}

	// TODO add 'Quest started!'

	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed('started quest'))] });

	client.end();

}

async function levelUp(interaction, monster_id, currentLevel) {

	currentLevel++;
	const experienceRequired = calculateExperienceRequired(currentLevel);
	await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`Congratulations! Your Monster has reached level ${currentLevel}. They need ${experienceRequired} experience to reach the next level.`))] });

	const client = new Client(con);
	await client.connect();

	try {
		// Update monster level and reset experience points
		let query = `UPDATE box SET level = ${currentLevel} AND SET xp = 0 WHERE id = ${monster_id};`;
		await client.query(query);

		// Delete record from this deployment
		query = `DELETE FROM deployments WHERE client_id = ${user.id};`;
		await client.query(query);
	}
	catch (error) {
		console.log('level up error');
	}

	client.end();

}

async function gainExperience(interaction, monster_id, currentLevel, currentExperience, amount) {
	currentExperience += amount;
	const experienceRequired = calculateExperienceRequired(currentLevel);
	if (currentExperience >= experienceRequired) {
		await levelUp(interaction, monster_id, currentLevel);
	}
	else {

		const client = new Client(con);
		await client.connect();

		try {
			const query = `UPDATE box SET xp = ${currentExperience};`;
			await client.query(query);
		}
		catch (error) {
			console.log('gain experience error');
		}

		client.end();
	}
	// TODO add 'You earned XXX experience!'
}

function calculateExperienceRequired(currentLevel) {
	return currentLevel * currentLevel * 100;
}
