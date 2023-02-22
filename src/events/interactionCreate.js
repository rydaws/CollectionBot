/* eslint-disable indent */
/* eslint-disable brace-style */
const { Events, MessageComponentInteraction } = require('discord.js');

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
			// const filter = i => i.customId === 'last_page' && i.user.id === interaction.user.id;
			// const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
			// collector.on('collect', async i => {
			// 	await i.update({ content: 'A button was clicked!', components: [] });
			// });
			// collector.on('end', collected => console.log(`Collected ${collected.size} items`));

		}
	},
};