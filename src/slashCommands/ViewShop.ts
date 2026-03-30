import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, User, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed } from "../util/EmbedUtil";
import { refreshItems, returnItem } from "../items/ItemList";
import { Commands } from "../CommandList";
import { refreshTraps } from "../items/Traps";
import { refreshAmplifiers } from "../items/Amplifiers";
import { Amplifier, Trap } from "../lib/types/global";
import prisma from "../util/prisma";

export default {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Displays the Shop")
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View the items"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("buy")
        .setDescription("Purchase items from the shop")
        .addStringOption((option) =>
          option
            .setName("item_name")
            .setDescription("Name of item to purchase")
            .setRequired(true)
            .addChoices(
              { name: "Mousetrap", value: "mousetrap" },
              { name: "Net", value: "net" },
              { name: "Lasso", value: "lasso" },
              { name: "Beartrap", value: "beartrap" },
              { name: "Safe", value: "safe" },
              { name: "Lucky Shmoin", value: "luckyshmoin" },
              { name: "Shmoizberry", value: "shmoizberry" }
            )
        )
        .addIntegerOption((option) =>
          option.setName("quantity").setDescription("Quantity of item").setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;

    try {
      const backpack = await prisma.backpack.findUnique({
        where: { client_id: BigInt(user.id) },
      });

      if (!backpack) {
        await interaction.reply({ embeds: [errorEmbed("Shop Error! Please use /start first.")] });
        return;
      }

      const shmoins = backpack.shmoins;

      if (interaction.options.getSubcommand() === "view") {
        await interaction.reply({ embeds: [createEmbed(user, shmoins)] });
        return;
      }

      if (interaction.options.getSubcommand() === "buy") {
        const item_name = interaction.options.getString("item_name")!;
        const quantity = interaction.options.getInteger("quantity")!;

        const item = returnItem(item_name);
        if (!item) {
          await interaction.reply({ embeds: [errorEmbed("Item not found!")] });
          return;
        }

        const price = item.price * quantity;

        if (!item.enabled) {
          console.log(`[Shop | ERROR] - Item ${item.name} is not enabled for purchase!`);
          await interaction.reply({ embeds: [errorEmbed("Item is not available for purchase at this time")] });
          return;
        }

        if (price > shmoins) {
          console.log(`[Shop | ERROR] - Client ${user.username} needs ${price - shmoins} more to afford ${quantity} ${item.name}'s`);
          await interaction.reply({ embeds: [failPurchase(item, quantity, price, shmoins)] });
          return;
        }

        await prisma.backpack.update({
          where: { client_id: BigInt(user.id) },
          data: {
            [item.name]: { increment: quantity },
            shmoins: { decrement: price },
          },
        });

        console.log(`[Shop] - Added ${quantity} ${item.name} for client ${user.username}`);
        console.log(`[Shop] - Deducted ${price} from client ${user.username}`);
        await interaction.reply({ embeds: [successPurchase(item, quantity, price)] });
      }
    } catch (error) {
      console.log("Error connecting to db");
      await interaction.reply({ embeds: [errorEmbed("Shop Error! Please contact staff!")] });
    }
  },
};

function createEmbed(user: User, shmoins: number): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setAuthor({ name: "Shop", iconURL: user.avatarURL()! })
    .setDescription("**View my wares...**")
    .setTimestamp();

  const trapList = refreshTraps();
  const amplifierList = refreshAmplifiers();
  const col: string[] = [];

  col.push(`**${user.username}'s Shmoins:** ${shmoins}\n\n`);

  if (trapList.length > 0) {
    col.push("══════════ Traps ══════════\n");
    trapList.forEach((item) => col.push(`${item.emoji} \`${item.bigName} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));
  }

  if (amplifierList.length > 0) {
    col.push("═════════ Amplifiers ═════════\n");
    amplifierList.forEach((item) => col.push(`${item.emoji} \`${item.bigName} ${addWhitespace(item)} ${item.price} Shmoins\`\n`));
  }

  embed.addFields({ name: " ", value: col.join(""), inline: true });
  return embed;
}

function successPurchase(item: Trap | Amplifier, quantity: number, price: number): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x32cd32)
    .setAuthor({ name: "Purchase success!", iconURL: "https://collection-monsters.s3.amazonaws.com/success.png" })
    .setDescription(`You purchased **${quantity} ${item.emoji}${item.bigName}**(s) for \`${price}\` Shmoins!`);
}

function failPurchase(item: Trap | Amplifier, quantity: number, price: number, shmoins: number) {
  return new EmbedBuilder()
    .setColor(0xfe514e)
    .setAuthor({ name: "Purchase failed!" })
    .setDescription(
      `You cannot afford **${quantity} ${item.emoji}${item.bigName}**(s)! You need \`${price - shmoins}\` more Shmoins!\n\nDo ${Commands.catch} to earn more Shmoins!`
    );
}

function addWhitespace(item: Amplifier | Trap) {
  const max = 30;
  const entire = 1 + item.bigName.length + item.price.toString().length + "Shmoins".length;
  return " ".repeat(Math.max(0, max - entire));
}
