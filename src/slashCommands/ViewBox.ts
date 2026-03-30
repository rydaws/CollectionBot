import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
  User,
} from "discord.js";
import { errorEmbed } from "../util/EmbedUtil";
import { Commands } from "../CommandList";
import prisma from "../util/prisma";

interface BoxState {
  user: User;
  ownerId: string;
  monsterCache: string[][];
  currentPage: number;
  pages: number;
}

// Per-user state for active box views
const boxStates = new Map<string, BoxState>();

export default {
  data: new SlashCommandBuilder()
    .setName("box")
    .setDescription("Shows your box of monsters")
    .addStringOption((option) => option.setName("client_id").setDescription("User's box you'd like to view")),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    let client_id = interaction.options.getString("client_id") ?? user.id;

    try {
      const boxEntries = await prisma.box.findMany({
        where: { client_id: BigInt(client_id) },
        include: { monsters: { select: { display_name: true } } },
        orderBy: { id: "asc" },
      });

      if (boxEntries.length === 0) {
        await interaction.reply({ embeds: [errorEmbed(`You do not own any monsters yet! Do ${Commands.show}`)] });
        return;
      }

      // Build page cache
      const monsterCache: string[][] = [];
      let column: string[] = [];
      let i = 0;

      boxEntries.forEach((entry) => {
        if (i >= 10) {
          monsterCache.push(column);
          column = [];
          i = 0;
        }
        column.push(`\`${entry.id}\` ${entry.monsters.display_name}\n`);
        i++;
      });
      monsterCache.push(column);

      const pages = Math.ceil(boxEntries.length / 20);

      boxStates.set(user.id, { user, ownerId: user.id, monsterCache, currentPage: 1, pages });

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({ name: `${user.username}'s box`, iconURL: user.avatarURL()! })
        .setDescription("**Page 1**")
        .setTimestamp()
        .setFooter({ text: `Page 1/${pages}` });

      if (boxEntries.length <= 10) {
        embed.addFields({ name: " ", value: monsterCache[0].join(""), inline: true });
      } else {
        embed.addFields(
          { name: " ", value: monsterCache[0].join(""), inline: true },
          { name: " ", value: monsterCache[1].join(""), inline: true }
        );
      }

      await interaction.reply({ embeds: [embed], components: [createButtons()] });
    } catch (error) {
      console.log(`[ViewBox | ERROR] Client ${client_id} does not own any monsters`);
      await interaction.reply({ embeds: [errorEmbed(`You do not own any monsters yet! Do ${Commands.show}`)] });
    }
  },

  async nextPage(interaction: ButtonInteraction) {
    const state = boxStates.get(interaction.user.id);
    if (!state) return;

    if (interaction.user.id !== state.ownerId) {
      console.log(`[ViewBox | ERROR] Button client: ${interaction.user.id} does not equal embed client: ${state.ownerId}`);
      return;
    }

    state.currentPage++;

    if (state.currentPage > state.pages) {
      console.log(`[ViewBox | ERROR] Page ${state.currentPage} does not exist within pages ${state.pages}`);
      await interaction.update({ content: "That page doesn't exist!" });
      state.currentPage--;
      return;
    }

    const pageIndex = (state.currentPage - 1) * 2;
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({ name: `${state.user.username}'s box`, iconURL: state.user.avatarURL()! })
      .setDescription(`**Page ${state.currentPage}**`)
      .setTimestamp()
      .setFooter({ text: `Page ${state.currentPage}/${state.pages}` })
      .setFields(
        { name: " ", value: state.monsterCache[pageIndex]?.join("") || "Empty", inline: true },
        { name: " ", value: state.monsterCache[pageIndex + 1]?.join("") || "Empty", inline: true }
      );

    await interaction.update({ content: "", embeds: [embed], components: [createButtons()] });
  },

  async lastPage(interaction: ButtonInteraction) {
    const state = boxStates.get(interaction.user.id);
    if (!state) return;

    if (state.currentPage === 1) {
      console.log(`[ViewBox | ERROR] Page 0 does not exist`);
      await interaction.update({ content: "That page doesn't exist!" });
      return;
    }

    state.currentPage--;

    const pageIndex = (state.currentPage - 1) * 2;
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({ name: `${state.user.username}'s box`, iconURL: state.user.avatarURL()! })
      .setDescription(`**Page ${state.currentPage}**`)
      .setTimestamp()
      .setFooter({ text: `Page ${state.currentPage}/${state.pages}` })
      .setFields(
        { name: " ", value: state.monsterCache[pageIndex]?.join("") || "Empty", inline: true },
        { name: " ", value: state.monsterCache[pageIndex + 1]?.join("") || "Empty", inline: true }
      );

    await interaction.update({ content: " ", embeds: [embed], components: [createButtons()] });
  },
};

function createButtons() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId("last_page").setLabel("Back").setStyle(ButtonStyle.Secondary).setEmoji("⬅️")
    )
    .addComponents(
      new ButtonBuilder().setCustomId("next_page").setLabel("Next").setStyle(ButtonStyle.Secondary).setEmoji("➡️")
    );
}
