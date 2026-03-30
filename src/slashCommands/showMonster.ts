import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed, showMonsterEmbed } from "../util/EmbedUtil";
import prisma from "../util/prisma";

export default {
  data: new SlashCommandBuilder()
    .setName("show")
    .setDescription("Shows stats for one of your monsters.")
    .addIntegerOption((option) => option.setName("id").setDescription("The id of the monster").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const client_id = BigInt(interaction.user.id);
    const monster_id = interaction.options.getInteger("id")!;

    try {
      const boxEntry = await prisma.box.findUnique({
        where: { client_id_id: { client_id, id: monster_id } },
      });

      if (!boxEntry) {
        await interaction.reply({ embeds: [errorEmbed("You do not own that monster")] });
        return;
      }

      const monster = await prisma.monsters.findUnique({ where: { id: monster_id } });
      if (!monster) {
        await interaction.reply({ embeds: [errorEmbed("Monster not found")] });
        return;
      }

      console.log(`[ShowMonster] Displaying monster with ID ${monster_id} from client ${client_id}`);
      await interaction.reply({
        embeds: [showMonsterEmbed(interaction.user, monster, boxEntry.level)],
      });
    } catch (error) {
      console.log(`[ShowMonster | ERROR] Client ${client_id} does not own monster ID ${monster_id}.`);
      await interaction.reply({ embeds: [errorEmbed("You do not own that monster")] });
    }
  },
};
