const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { catchEmbed, errorEmbed, runaway, badCatch, successCatch } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');
const { monsters } = require('../monsters/MonsterDetails');
const { mousetrap, net, lasso, beartrap, safe } = require('../items/Traps');
const { luckyshmoin, shmoizberry } = require('../items/Amplifiers');

// Global variables
let res;
let roll_id;
let potentialMonsters;
let size;
let backpack;
let ownerId;
let timeoutId;
let caughtMonster;

// Incoming SlashCommand
module.exports = {
	data: new SlashCommandBuilder()
		.setName('catch')
		.setDescription('Encounter a monster and attempt to capture it!'),
	async execute(interaction) {
		// ID of user who "owns" this embed
		ownerId = interaction.user.id;

		// Begin catch event
		await catchEvent(interaction);

	},
	/**
	 * Attempt is triggered once button below embed is pressed.
	 *
	 * @param interaction - The interaction from the event.
	 * @param device - Trap that was used
	 * @returns {Promise<void>} - Waits for catch to finish before continuing.
	 */
	async catchAttempt(interaction, device) {

		// Clears runaway trigger
		clearTimeout(timeoutId);

		// Only allows "owner" of embed to interact with it.
		if (interaction.user.id !== ownerId) {
			console.log(`[Catch | ERROR] - Button client: ${interaction.user.id} does not equal embed client: ${ownerId}`);
			return;
		}

		// Random number 0 - 100
		const randomRoll = Math.random() * 100;

		// Includes items that increase catch rate
		let catchAmp = 0;
		if (backpack.rows[0].shmoizberry !== 0) {
			catchAmp = shmoizberry.property * backpack.rows[0].shmoizberry;
		}

		console.log('[Catch] - Roll', randomRoll);
		console.log('[Catch] - Catch rate', caughtMonster.catchRate);
		console.log('[Catch] - Device catch rate', device.catchRate);
		console.log('[Catch] - Catch amp', catchAmp);

		// Total catch rate with all modifiers
		const totalCatchRate = caughtMonster.catchRate + device.catchRate + catchAmp;
		console.log('[Catch] - Total catch rate', totalCatchRate);

		// SQL connection
		const client = new Client(con);
		await client.connect();

		try {
			// If random roll is <= your total catch rate, catch is successful
			if (randomRoll <= totalCatchRate) {

				// Adds Monster to player's box
				await client.query(`INSERT INTO box VALUES (${ownerId}, ${roll_id}, 1)`);
				console.log(`[Catch] - Added ${roll_id} to ${interaction.user.username}'s box`);

				// Includes items that increase payout from catch event
				let shmoinAmplifier = 1;
				if (backpack.rows[0].luckyshmoin !== 0) {
					shmoinAmplifier = (1 + luckyshmoin.property) * backpack.rows[0].luckyshmoin;
				}

				console.log('[Catch] - Shmoin Amp', shmoinAmplifier);

				// Reward player with shmoins for catch
				const shmoinsToAdd = Math.floor(Math.random() * (250 - 125 + 1) + 125 * caughtMonster.shmoinMulti * shmoinAmplifier);

				// Deducts 1 trap from player's backpack and adds shmoins
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
			console.log(`[Catch | ERROR] - Failed to catch monster for ${interaction.user.username}.`);
			await interaction.followUp({ embeds: [new EmbedBuilder(errorEmbed('Error! Please contact staff if this issue persists'))] });
		}

		// Close SQL connection
		client.end();

	},

};

/**
 * Chooses unowned Monster and display's event to user.
 *
 * @param interaction - The embed interaction
 * @returns {Promise<void>} - Waits for chosen monster before proceeding.
 */
async function catchEvent(interaction) {
	console.log(`[Catch] - Begin Catch Event for ${ownerId}`);
	let newPMonsters;
	// SQL connection
	const client = new Client(con);
	await client.connect();

	try {
		newPMonsters = await client.query(`SELECT monsters.rarity, monsters.display_name, monsters.id
FROM monsters
WHERE
monsters.id not in (SELECT box.id FROM box where client_id = ${ownerId})
ORDER BY rarity
`);
	}
	catch (e) {
		console.log('monster not found error');
	}

	const pRarity = [];

	Object.keys(newPMonsters.rows).forEach((mon) => {
		pRarity.push(mon.rarity);
	});

	console.log('All', pRarity);

	monsters.filter((mon) => pRarity.includes(mon.rarity));

	monsters.forEach((mon) => console.log(mon.rarity));

	// Adds up all the encounter rates for the rarities
	const totalEncounterRate = monsters.reduce((sum, monster) => sum + monster.encounterRate, 0);

	// Determines random roll based on total encounter rate
	let randomRoll = Math.floor(Math.random() * totalEncounterRate) + 1;

	// Iterates through all objects, the lowest chance is hardest to obtain as the roll has to be
	// lower than or equal to the encounter rate of the index.
	// Determines rarity to pick
	for (let i = 0; i < monsters.length; i++) {
		if (randomRoll <= monsters[i].encounterRate) {
			caughtMonster = monsters[i];
			break;
		}
		randomRoll -= monsters[i].encounterRate;
	}

	console.log(`[Catch] - Rarity ${caughtMonster.rarity} chosen.`);

	try {

		// Select monster that user does not already own
		potentialMonsters = await client.query(`SELECT id from monsters WHERE id not in (SELECT id from box where client_id=${interaction.user.id}) AND rarity = '${caughtMonster.rarity}'`);

		// Populate backpack elements to see what traps are available
		backpack = await client.query(`SELECT * FROM backpack WHERE client_id = ${ownerId}`);

		// If the potentialMonsters returned is 0, user has all the monsters
		size = Object.keys(potentialMonsters.rows).length;

		// TODO instead, have it reroll until a monster is found?
		// Notes: infinite roll if we just recall function, will have to revist

		// Cancel catch interaction
		if (size === 0) {
			console.log(`[Catch | ERROR] Client ${ownerId} owns all monsters.`);
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You already own all monsters of the ${caughtMonster.rarity} rarity! Focus on training them with ${Commands.quest}`))] });
			return;
		}

		// ID of monster to display for catch event
		roll_id = potentialMonsters.rows[Math.floor(Math.random() * (size))].id;

		// Get monster data from DB
		res = await client.query(`SELECT * FROM monsters WHERE id=${roll_id}`);

		// Runaway embed update if user does not interact within certain 5 seconds
		timeoutId = setTimeout(async () => {
			await interaction.editReply({ content: 'The monster ran away!', embeds: [new EmbedBuilder(runaway(interaction.user, res))], components: [] });
		}, 5000);

		const msg = 'Click any of the options at the bottom to attempt capture!';

		await interaction.reply({ content: msg, embeds: [new EmbedBuilder(catchEmbed(interaction.user, res))], components: [createButtons()] });

	}
	catch (e) {
		console.log(`[Catch | ERROR] - No monsters found with ${caughtMonster.rarity}`);
		// Clears runaway trigger
		clearTimeout(timeoutId);
	}

	// Close SQL connection
	client.end();

}

/**
 * Creates trap buttons below embed for user to interact with.
 *
 * @returns {ActionRowBuilder<AnyComponentBuilder>} - Button row below embed.
 */
function createButtons() {

	// Do inventory check before displaying available catch devices.
	const buttons = new ActionRowBuilder();
	const mousetrapAmt = backpack.rows[0].mousetrap;
	const netAmt = backpack.rows[0].net;
	const lassoAmt = backpack.rows[0].lasso;
	const beartrapAmt = backpack.rows[0].beartrap;
	const safeAmt = backpack.rows[0].safe;

	// If user has 0 of a certain trap, do not display button.

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

