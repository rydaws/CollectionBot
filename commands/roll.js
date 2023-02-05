/* eslint-disable indent */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a random number')
        .addIntegerOption(option =>
            option.setName('lower')
                .setDescription('The lower bound of your random roll')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('upper')
                .setDescription('The lower bound of your random roll')
                .setRequired(true)),
	async execute(interaction) {
        const lower = interaction.options.getInteger('lower');
        const upper = interaction.options.getInteger('upper');
        const roll = Math.floor(Math.random() * (upper - lower + 1)) + lower;

        await interaction.reply(`Lower bound: ${lower} Upper bound: ${upper} Random roll result: ${roll}`);
	},
};
