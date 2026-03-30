import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed, textEmbed } from "../util/EmbedUtil";
import prisma from "../util/prisma";

export default {
  data: new SlashCommandBuilder()
    .setName("addmonster")
    .setDescription("Adds monster to your box")
    .addIntegerOption((option) => option.setName("id").setDescription("The id of the monster").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const client_id = BigInt(interaction.user.id);
    const monster_id = interaction.options.getInteger("id")!;

    try {
      await prisma.box.create({
        data: { client_id, id: monster_id, level: 1 },
      });

      const monster = await prisma.monsters.findUnique({ where: { id: monster_id } });
      const monster_name = monster?.display_name ?? "Unknown";

      console.log(`[AddMonster] Added ${monster_name} with id ${monster_id} to client ${client_id}'s box.`);
      await interaction.reply({ embeds: [textEmbed(`Added ${monster_name} to your box`)] });
    } catch (error) {
      console.log(`[AddMonster | ERROR] Failed to add monster to ${client_id}'s box.`);
      await interaction.reply({
        embeds: [errorEmbed("That monster does not exist or you already own it!")],
      });
    }
  },
};
