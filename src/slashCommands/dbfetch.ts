import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types";
import { errorEmbed } from "../util/EmbedUtil";
import { fetchMonsterDetails } from "../monsters/MonsterDetails";
import prisma from "../util/prisma";

const dbfetchCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("fetch")
    .setDescription("Fetch monster from db by id")
    .addIntegerOption((option) => option.setName("id").setDescription("The id of the monster").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const id = interaction.options.getInteger("id")!;
    const user = interaction.user;

    try {
      const monster = await prisma.monsters.findUnique({ where: { id } });

      if (!monster) {
        await interaction.reply({ embeds: [errorEmbed("Could not fetch monster with that ID!")] });
        return;
      }

      console.log(`[Fetch] Retrieving monster with ID ${id} and name ${monster.display_name}.`);

      const embed = new EmbedBuilder()
        .setColor(fetchMonsterDetails(monster.rarity)?.color || 0x333333)
        .setTitle("Queried Monster")
        .setAuthor({ name: user.username, iconURL: user.avatarURL()! })
        .setDescription("Stats for the monster")
        .setThumbnail(monster.img)
        .addFields(
          { name: "Name", value: monster.display_name, inline: true },
          { name: "Class", value: monster.class, inline: true },
          { name: "Type", value: monster.type, inline: true },
          { name: "Rarity", value: monster.rarity, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.log(`[Fetch | ERROR] Failed to fetch monster with id ${id}.`);
      await interaction.reply({ embeds: [errorEmbed("Could not fetch monster with that ID!")] });
    }
  },
};

export default dbfetchCommand;
