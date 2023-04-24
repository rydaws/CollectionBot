const { SlashCommandBuilder } = require('discord.js');

let userID;

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
				.setDescription('Set out on your quest')),
	async execute(interaction) {
		// ID of user who "owns" this embed
		userID = interaction.user.id;


	},
};