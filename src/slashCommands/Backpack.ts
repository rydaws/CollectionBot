import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User } from "discord.js";
import { getAllItems } from "../items/ItemList";
import { Trap, Amplifier } from "../lib/types/global";
import prisma from "../util/prisma";

export default {
  data: new SlashCommandBuilder().setName("backpack").setDescription("View what items you have in your backpack"),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;

    try {
      const backpack = await prisma.backpack.findUnique({
        where: { client_id: BigInt(user.id) },
      });

      if (!backpack) {
        await interaction.reply({ content: "You don't have a backpack yet! Use /start first." });
        return;
      }

      await interaction.reply({ embeds: [backpackEmbed(user, backpack)] });
    } catch (e) {
      console.log(`[Backpack | ERROR] Could not fetch Backpack of user ${user.username}`);
    }
  },
};

function backpackEmbed(user: User, backpack: Record<string, any>) {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setAuthor({ name: `${user.username}'s Backpack`, iconURL: user.avatarURL()! })
    .setDescription("**Contents:**")
    .setTimestamp();

  const col: string[] = [];
  col.push(`**${user.username}'s Shmoins:** ${backpack.shmoins}\n\n`);

  const allItems = getAllItems();
  allItems.forEach((item: Trap | Amplifier) =>
    col.push(
      `${item.emoji} \`${item.bigName} ${addWhitespace(item, backpack[item.name])} Quantity: ${backpack[item.name]}\`\n`
    )
  );

  embed.addFields({ name: " ", value: `${col.join("")}`, inline: true });
  return embed;
}

function addWhitespace(item: Trap | Amplifier, quantity: number) {
  const max = 30;
  const entire = 1 + item.bigName.length + "Quantity".length + quantity.toString().length;
  return " ".repeat(Math.max(0, max - entire));
}
