/* eslint-disable indent */
/* eslint-disable brace-style */
const { Events, MessageComponentInteraction, Client } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
		else if (interaction.isButton()) {
			const button = interaction.client.commands.get(interaction.customId);

			if (!button) {
				return new Error('No code');
			}
			try {
				await button.execute(interaction);
			}
			catch (error) {
				console.log(`Error executing ${interaction.customId}`);
				console.log(error);
			}
		}
	},
};