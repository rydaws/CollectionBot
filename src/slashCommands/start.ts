import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed, textEmbed } from "../util/EmbedUtil";
import prisma from "../util/prisma";

export default {
  data: new SlashCommandBuilder().setName("start").setDescription("Creates profile for user"),
  async execute(interaction: ChatInputCommandInteraction) {
    const id = BigInt(interaction.user.id);

    try {
      console.log(`[Start] Adding if not exists ${id}`);

      await prisma.player.upsert({
        where: { client_id: id },
        create: { client_id: id },
        update: {},
      });

      await prisma.backpack.upsert({
        where: { client_id: id },
        create: { client_id: id, shmoins: 100 },
        update: {},
      });

      console.log(`[Start] Created profile for ${interaction.user.username}`);
      await interaction.reply({
        embeds: [textEmbed("Profile successfully created! Do /catch to start your journey.")],
      });
    } catch (error) {
      console.log(`[Start | ERROR] Profile could not be created for ${id}`);
      await interaction.reply({
        embeds: [errorEmbed("Something went wrong, profile not created. Contact staff!")],
      });
    }
  },
};
