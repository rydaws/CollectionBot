const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setActive } = require('../../shop/CatchingGear');
const { errorEmbed } = require('../../util/EmbedUtil');

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

		setActive(trap, activity);

		await interaction.reply(`Updated ${trap} to ${activity}.`);
	},
};