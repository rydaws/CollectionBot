const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../util/EmbedUtil');
const { getAllItems, returnItem } = require('../../items/ItemList');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateshop')
		.setDescription('Update items items')
		.addStringOption(option =>
			option.setName('choice')
				.setDescription('Item to change activity of')
				.setRequired(true)
				.addChoices({ name: 'Mousetrap', value: 'mouseitem' },
					{ name: 'Net', value: 'net' },
					{ name: 'Lasso', value: 'lasso' },
					{ name: 'Bearitem', value: 'bearitem' },
					{ name: 'Safe', value: 'safe' },
					{ name: 'Lucky Shmoin', value: 'luckyshmoin' },
					{ name: 'Shmoizberry', value: 'shmoizberry' },
					{ name: 'all', value: 'all' },
				))
		.addBooleanOption(option =>
			option.setName('activity')
				.setDescription('Status to update to')
				.setRequired(true)),
	async execute(interaction) {
		const choice = interaction.options.getString('choice');
		const activity = interaction.options.getBoolean('activity');
		console.log(choice);

		const member = interaction.member;

		// TODO can have bot make a role to check for to enable any server to function with bot
		// Checks that member is Staff, otherwise deny.
		if (!member.roles.cache.some(role => role.name === 'Staff')) {
			console.log('No perms');
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('You do not have permission!'))] });

			setTimeout(async () => {
				await interaction.deleteReply();
			}, 5000);
			return;
		}

		const itemList = getAllItems();

		if (choice === 'all') {

			itemList.forEach((items) => items.enabled = activity);
			await interaction.reply(`All traps set to ${activity}`);
			return;
		}

		returnItem(choice).enabled = activity;

		await interaction.reply(`Updated ${choice} to ${activity}.`);
	},
};