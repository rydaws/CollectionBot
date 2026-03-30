import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed, textEmbed } from "../util/EmbedUtil";
import prisma from "../util/prisma";

export default {
  data: new SlashCommandBuilder()
    .setName("uplevel")
    .setDescription("Bumps specified monster level by 1")
    .addIntegerOption((option) => option.setName("id").setDescription("The id of the monster").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const client_id = BigInt(interaction.user.id);
    const monster_id = interaction.options.getInteger("id")!;

    try {
      const updated = await prisma.box.update({
        where: { client_id_id: { client_id, id: monster_id } },
        data: { level: { increment: 1 } },
      });

      console.log(`[LevelMonster] Increased monster with ID ${monster_id} to ${updated.level}.`);
      await interaction.reply({ embeds: [textEmbed(`Increased level for ${monster_id} to ${updated.level}`)] });
    } catch (error) {
      console.log(`[LevelMonster | ERROR] Client ${client_id} does not own monster ID ${monster_id}.`);
      await interaction.reply({ embeds: [errorEmbed("You do not own that monster")] });
    }
  },
};
