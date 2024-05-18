import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a random number')
		.addIntegerOption((option) => {
			return option.setName('lower').setDescription('Lower number').setRequired(true);
		})
		.addIntegerOption(option => {
			return option.setName('upper')
				.setDescription('The upper bound of your random roll')
				.setRequired(true);
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	execute: async (interaction) => {
		const lower = interaction.options.getInteger('lower');
		const upper = interaction.options.getInteger('upper');
		if (!lower || !upper) return;
		const roll = Math.floor(Math.random() * (upper - lower + 1)) + lower;

		await interaction.reply(`Lower bound: ${lower} Upper bound: ${upper} Random roll result: ${roll}`);
	},
	cooldown: 5
};

export default command;