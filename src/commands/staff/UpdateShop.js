const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { setActive } = require('../../shop/CatchingGear');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateshop')
		.setDescription('Update shop items')
		.addStringOption(option =>
			option.setName('trap')
				.setDescription('Trap to change activity of')
				.setRequired(true)
				.addChoices(
					{ name: 'Mousetrap', value: 'mousetrap' },
					{ name: 'Net', value: 'net' },
					{ name: 'Lasso', value: 'lasso' },
					{ name: 'Beartrap', value: 'beartrap' },
					{ name: 'Safe', value: 'safe' },
				))
		.addBooleanOption(option =>
			option.setName('activity')
				.setDescription('Status to update to')
				.setRequired(true)),
	async execute(interaction) {
		const trap = interaction.options.getString('trap');
		const activity = interaction.options.getBoolean('activity');

		setActive(trap, activity);

		await interaction.reply(`Updated ${trap} to ${activity}.`);
	},
};