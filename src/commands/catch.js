const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { catchEmbed, errorEmbed, runaway, badCatch, successCatch } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { monsters } = require('../monsters/MonsterDetails');
const { mousetrap, net, lasso, beartrap, safe } = require('../shop/CatchingGear');


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
	async catchAttempt(interaction, device) {

		clearTimeout(timeoutId);
		if (interaction.user.id !== ownerId) {
			console.log(`[Catch | ERROR] Button client: ${interaction.user.id} does not equal embed client: ${ownerId}`);
			return;
		}

		const randomRoll = Math.random() * 100;

		console.log('[Catch] - Roll', randomRoll);
		console.log('[Catch] - Catch rate', caughtMonster.catchRate);
		console.log('[Catch] - Device catch rate', device.catchRate);
		const totalCatchRate = caughtMonster.catchRate + device.catchRate;
		console.log('[Catch] - Total catch rate', totalCatchRate);
		const client = new Client(con);
		await client.connect();


		try {
			if (randomRoll <= totalCatchRate) {

				// Adds Monster to player's box
				await client.query(`INSERT INTO box VALUES (${ownerId}, ${roll_id}, 1)`);
				console.log(`[Catch] Added ${roll_id} to ${interaction.user.username}'s box`);

				// Reward player with shmoins for catch
				const shmoinsToAdd = Math.floor(Math.random() * (250 - 125 + 1) + 125) * caughtMonster.shmoinMulti;

				// Deducts 1 catching device from player's backpack and adds shmoins
				await client.query(`UPDATE backpack SET ${device.name} = (SELECT ${device.name} FROM backpack WHERE client_id = ${ownerId}) - 1, shmoins = (SELECT shmoins FROM backpack WHERE client_id = ${ownerId}) + ${shmoinsToAdd} WHERE client_id = ${ownerId}`);
				console.log(`[Catch] - Deducted 1 ${device.name} from client ${interaction.user.username}`);
				console.log(`[Catch] - Added ${shmoinsToAdd} to client ${interaction.user.username}`);

				await interaction.update({ content: ' ', embeds: [new EmbedBuilder(successCatch(interaction.user, res, shmoinsToAdd))], components: [] });
			}
			else {
				console.log(`[Catch] - Catch failed for ${ownerId}`);
				await interaction.update({ content: ' ', embeds: [new EmbedBuilder(badCatch(interaction.user, res))], components: [] });
			}
		}
		catch (e) {
			console.log(`[Catch | ERROR] Failed to catch monster for ${interaction.user.username}.`);
			await interaction.followUp({ embeds: [new EmbedBuilder(errorEmbed('Error! Please contact staff if this issue persists'))] });
		}

		client.end();


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
	const mousetrapAmt = backpack.rows[0].mousetrap;
	const netAmt = backpack.rows[0].net;
	const lassoAmt = backpack.rows[0].lasso;
	const beartrapAmt = backpack.rows[0].beartrap;
	const safeAmt = backpack.rows[0].safe;

	if (mousetrapAmt > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_mousetrap')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(mousetrap.emoji),
		);
	}
	if (netAmt > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_net')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(net.emoji),
		);
	}
	if (lassoAmt > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_lasso')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(lasso.emoji),
		);
	}
	if (beartrapAmt > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_beartrap')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(beartrap.emoji),
		);
	}
	if (safeAmt > 0) {
		buttons.addComponents(
			new ButtonBuilder()
				.setCustomId('catch_safe')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(safe.emoji),
		);
	}

	return buttons;
}

