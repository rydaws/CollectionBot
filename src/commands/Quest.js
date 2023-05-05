const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');

let user;
let deployments;
let team;
let col = [];
const QUEST_LENGTH = '2 minutes';

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
							ELSE CONCAT(
							  EXTRACT(hour FROM time_left), ' hours, ',
							  EXTRACT(minute FROM time_left), ' minutes left'
							)
						  END AS status
						FROM (
						  SELECT start_time, end_time, end_time - NOW() AS time_left
						  FROM deployments
						) AS subquery;`;
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
			console.log(`[Quest | ERROR] - Could not gather box & deployment info from database for ${user.username}`);
		}

		let ended = false;
		col = [];
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

			ended = questStatus(interaction);

			if (ended) {

				try {

					// Delete record from this deployment
					const query = `DELETE FROM deployments WHERE client_id = ${user.id};`;
					await client.query(query);
				}
				catch (error) {
					console.log(`[Quest | ERROR] - Could not remove deployment for ${user.username}`);
				}

				await interaction.reply({ embeds: [createEmbed()] });

			}
			else {
				await interaction.reply({ embeds: [new EmbedBuilder(textEmbed(`You have a quest active that has ${Math.round(10 * deployments.rows[0].status) / 10} hours left.`))] });
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

function questStatus() {
	const isQuestActive = deployments.rows[0].status;

	// Random XP between 50 and 150 ((Max - Min + 1) + min)
	const experienceToGive = Math.floor(Math.random() * (150 - 50 + 1) + 50);

	if (isQuestActive === 'Ended') {
		team.rows.forEach((monster) => gainExperience(monster.id, monster.display_name, monster.level, monster.xp, experienceToGive));

		return true;
	}
	else {

		return false;
	}

}

async function questStart(interaction) {

	const client = new Client(con);
	await client.connect();


	try {
		team.rows.forEach((member) => {
			client.query(`INSERT INTO deployments (client_id, id, start_time, end_time)
						VALUES (${user.id}, ${member.id}, NOW(), NOW() + INTERVAL '${QUEST_LENGTH}');`);
		});
	}
	catch (error) {
		console.log(`[Quest | ERROR] - Could not create deployment for ${user.username}`);
		return;
	}

	console.log(`[Quest] - Quest started for user ${user.username} which will end in ${QUEST_LENGTH}`);
	await interaction.reply({ embeds: [createStartEmbed()] });

	client.end();

}

function levelUp(monster_id, monster_name, currentLevel) {

	currentLevel++;
	const experienceRequired = calculateExperienceRequired(currentLevel);

	console.log(`[Quest] - ${monster_name} increased to level ${currentLevel} for ${user.username}. They need ${experienceRequired} to level up`);

	col.push(`⏫ **${monster_name}** has leveled up to Lv \`${currentLevel}\`!\n`);

	updateDB('levelUp', monster_id, currentLevel, experienceRequired).then(() => console.log(`[Quest] - DB level up success for ${monster_name} for ${user.username}`));

}

function gainExperience(monster_id, monster_name, currentLevel, currentExperience, amount) {
	currentExperience += amount;
	const experienceRequired = calculateExperienceRequired(currentLevel);
	if (currentExperience >= experienceRequired) {
		levelUp(monster_id, monster_name, currentLevel, experienceRequired);
	}
	else {

		col.push(`🔼 **${monster_name}** has gained \`${amount}\` XP!\n`);

		updateDB('addExperience', monster_id, currentExperience, experienceRequired).then(() => console.log(`[Quest] - DB experience increase success for ${monster_name} for ${user.username}`));
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

function createStartEmbed() {

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Quest started!')
		.setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL() })
		.setDescription(`Your quest will be done in ${QUEST_LENGTH}, check it's status with ${Commands.quest[0]}`)
		.setTimestamp();
}

async function updateDB(command, monster_id, updatedValue, experienceRequired) {

	const client = new Client(con);
	await client.connect();

	let query;
	switch (command) {
	case 'addExperience':

		try {
			query = `UPDATE box SET xp = ${updatedValue}, xp_required = ${experienceRequired} WHERE client_id = ${user.id} AND id = ${monster_id} AND active = true;`;
			await client.query(query);
		}
		catch (error) {
			console.log(`[Quest | ERROR] - Could not add experience for ${user.username}`);
		}

		break;

	case 'levelUp':
		try {
			// Update monster level and reset experience points
			query = `UPDATE box SET level = ${updatedValue}, xp = 0, xp_required = ${experienceRequired} WHERE client_id = ${user.id} AND id = ${monster_id} AND active = true;`;
			await client.query(query);

		}
		catch (error) {
			console.log(`[Quest | ERROR] - Could not update level for ${user.username}`);
		}
		break;
	}

	client.end();

}
