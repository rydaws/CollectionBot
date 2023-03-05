const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { monsterEmbed, errorEmbed, textEmbed } = require('../util/EmbedUtil');
const { Commands } = require('../CommandList');
const { con } = require('../util/QueryUtil');
const { Client } = require('pg');


let res;
let size;
let backpack;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('catch')
		.setDescription('Encounter a monster and attempt to capture it!'),
	async execute(interaction) {
		const client_id = interaction.user.id;

		const client = new Client(con);
		await client.connect();

		try {
			// Select monster that user does not already own
			res = await client.query(`SELECT id from monsters WHERE id not in (SELECT id from box where client_id=${client_id})`);

			// If the list returned is 0, user has all the monster
			size = Object.keys(res.rows).length;

			// Cancel catch interaction
			if (size === 0) {
				console.log(`[Catch | ERROR] Client ${client_id} owns all monsters.`);
				await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed(`You already own all of the monsters! Focus on training them with ${Commands.quest}`))] });
				return;
			}

			// ID of monster to display for catch event
			const roll_id = res.rows[Math.floor(Math.random() * (size))].id;

			backpack = await client.query(`SELECT mousetrap, net, lasso, beartrap, safe FROM backpack WHERE client_id = ${client_id}`);

			// Begin catch event
			await catchEvent(interaction);

			// TODO only do if catch event is successful
			// await client.query(`INSERT INTO box VALUES (${client_id}, ${roll_id}, 1)`);
			console.log(`[Catch] Added ${roll_id} to ${interaction.user.username}'s box`);

			res = await client.query(`SELECT * FROM monsters WHERE id=${roll_id}`);

			const timeoutId = setTimeout(async () => {
				await interaction.editReply({ content: `You captured ${res.rows[0].display_name}!`, embeds: [new EmbedBuilder(monsterEmbed(interaction.user, res))] });
			}, 5000);

			// clearTimeout(timeoutId);
		}
		catch (error) {
			console.log(`[Catch | ERROR] Failed to catch monster for ${client_id}.`);
			await interaction.followUp({ embeds: [new EmbedBuilder(errorEmbed('Error! Please contact staff if this issue persists'))] });
		}

		client.end();

	},

};

async function catchEvent(interaction) {
	console.log('Catch');
	const msg = 'Click any of the options at the bottom to attempt capture!';

	await interaction.reply({ content: 'placeholder', embeds: [new EmbedBuilder(textEmbed(msg))], components: [createButtons()] });

	return interaction;


}

function createEmbed() {

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('A Monster appeared!')
		.setDescription('');
}

function createButtons() {

	// Do inventory check before displaying available catch devices.
	const buttons = new ActionRowBuilder();
	const mousetrap = backpack.rows[0].mousetrap;
	const net = backpack.rows[0].net;
	const lasso = backpack.rows[0].lasso;
	const beartrap = backpack.rows[0].beartrap;
	const safe = backpack.rows[0].safe;
	console.log(mousetrap + net + lasso + beartrap + safe);

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
