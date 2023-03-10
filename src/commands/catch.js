const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { catchEmbed, errorEmbed, runaway, badCatch, successCatch } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { monsters } = require('../monsters/MonsterDetails');


let res;
let roll_id;
let potentialMonsters;
let size;
let backpack;
let ownerId;
let timeoutId;
let caughtMonster;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('catch')
		.setDescription('Encounter a monster and attempt to capture it!'),
	async execute(interaction) {
		ownerId = interaction.user.id;

		// Begin catch event
		await catchEvent(interaction);

	},
	async catchMousetrap(interaction) {

		clearTimeout(timeoutId);
		if (interaction.user.id !== ownerId) {
			console.log(`[Catch | ERROR] Button client: ${interaction.user.id} does not equal embed client: ${ownerId}`);
			return;
		}

		const randomRoll = Math.random() * 100;

		console.log('[Catch] - Roll', randomRoll);
		console.log('[Catch] - Catch rate', caughtMonster.catchRate);
		if (randomRoll <= caughtMonster.catchRate) {
			console.log(`[Catch] - SUCCESS Monster blank added to ${ownerId} box`);
			const client = new Client(con);
			await client.connect();

			try {

				await client.query(`INSERT INTO box VALUES (${ownerId}, ${roll_id}, 1)`);
				console.log(`[Catch] Added ${roll_id} to ${interaction.user.username}'s box`);
				await interaction.update({ content: ' ', embeds: [new EmbedBuilder(successCatch(interaction.user, res))], components: [] });
			}
			catch (e) {
				console.log(`[Catch | ERROR] Failed to catch monster for ${ownerId}.`);
				await interaction.followUp({ embeds: [new EmbedBuilder(errorEmbed('Error! Please contact staff if this issue persists'))] });
			}

			client.end();
		}
		else {
			console.log(`[Catch] - Catch failed for ${ownerId}`);
			await interaction.update({ content: ' ', embeds: [new EmbedBuilder(badCatch(interaction.user, res))], components: [] });
		}

	},

};

async function catchEvent(interaction) {
	console.log(`[Catch] - Begin Catch Event for ${ownerId}`);

	// Adds up all the encounter rates for the rarities
	const totalCatchRate = monsters.reduce((sum, monster) => sum + monster.encounterRate, 0);

	// Determines random roll based on total encounter rate
	let randomRoll = Math.floor(Math.random() * totalCatchRate) + 1;

	// Iterates through all objects, the lowest chance is hardest to obtain as the roll has to be
	// lower than or equal to the encounter rate of the index.
	for (let i = 0; i < monsters.length; i++) {
		if (randomRoll <= monsters[i].encounterRate) {
			caughtMonster = monsters[i];
			break;
		}
		randomRoll -= monsters[i].encounterRate;
	}

	console.log(`[Catch] - Rarity ${caughtMonster.rarity} chosen.`);

	// Establish DB connection
	const client = new Client(con);
	await client.connect();

	try {

		// Select monster that user does not already own
		potentialMonsters = await client.query(`SELECT id from monsters WHERE id not in (SELECT id from box where client_id=${interaction.user.id}) AND rarity = '${caughtMonster.rarity}'`);

		// Populate backpack elements to see what catching devices are available
		backpack = await client.query(`SELECT mousetrap, net, lasso, beartrap, safe FROM backpack WHERE client_id = ${ownerId}`);

		// If the potentialMonsters returned is 0, user has all the monsters
		size = Object.keys(potentialMonsters.rows).length;

		// TODO instead, have it reroll until a monster is found?
		// Cancel catch interaction
		if (size === 0) {
			console.log(`[Catch | ERROR] Client ${ownerId} owns all monsters.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You already own all of the monsters of the ${caughtMonster.rarity} rarity! Focus on training them with ${Commands.quest}`))] });
			return;
		}

		// ID of monster to display for catch event
		roll_id = potentialMonsters.rows[Math.floor(Math.random() * (size))].id;

		res = await client.query(`SELECT * FROM monsters WHERE id=${roll_id}`);

		timeoutId = setTimeout(async () => {
			// await interaction.editReply({ content: `You captured ${res.rows[0].display_name}!`, embeds: [new EmbedBuilder(monsterEmbed(interaction.user, res))] });
			await interaction.editReply({ content: 'The monster ran away!', embeds: [new EmbedBuilder(runaway(interaction.user, res))], components: [] });
		}, 5000);

		const msg = 'Click any of the options at the bottom to attempt capture!';

		console.log(10);
		await interaction.reply({ content: msg, embeds: [new EmbedBuilder(catchEmbed(interaction.user, res))], components: [createButtons()] });

	}
	catch (e) {
		console.log(`[Catch | ERROR] - No monsters found with ${caughtMonster.rarity}`);
		clearTimeout(timeoutId);
	}

}

function createButtons() {

	// Do inventory check before displaying available catch devices.
	const buttons = new ActionRowBuilder();
	const mousetrap = backpack.rows[0].mousetrap;
	const net = backpack.rows[0].net;
	const lasso = backpack.rows[0].lasso;
	const beartrap = backpack.rows[0].beartrap;
	const safe = backpack.rows[0].safe;

	if (mousetrap > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_mousetrap')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('<:mousetrap:1082044930677031032>'),
		);
	}
	if (net > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_net')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('2️⃣'),
		);
	}
	if (lasso > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_lasso')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('3️⃣'),
		);
	}
	if (beartrap > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_beartrap')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('4️⃣'),
		);
	}
	if (safe > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_safe')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('5️⃣'),
		);
	}

	return buttons;
}

