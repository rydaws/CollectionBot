const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../util/EmbedUtil');
const { getAllItems, returnItem } = require('../../items/ItemList');

// Incoming SlashCommand
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
		// Gathers options from command
		const choice = interaction.options.getString('choice');
		const activity = interaction.options.getBoolean('activity');

		// Gets member of user to check role
		const member = interaction.member;

		// TODO can have bot make a role to check for to enable any server to function with bot
		// Checks that member is Staff, otherwise deny.
		if (!member.roles.cache.some(role => role.name === 'Staff')) {
			console.log('No perms');
			await interaction.reply({ embeds: [new EmbedBuilder(errorEmbed('You do not have permission!'))] });

			// TODO make this a "only this user can see" embed
			// Delete reply as to not clutter channel
			setTimeout(async () => {
				await interaction.deleteReply();
			}, 5000);
			return;
		}

		const itemList = getAllItems();

		// Changes activity of all items
		if (choice === 'all') {

			itemList.forEach((items) => items.enabled = activity);
			await interaction.reply(`All traps set to ${activity}`);
			return;
		}

		// Changes activity of singular item.
		returnItem(choice).enabled = activity;

		await interaction.reply(`Updated ${choice} to ${activity}.`);
	},
};