import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { errorEmbed } from "../../util/EmbedUtil";
import { getAllItems, returnItem } from "../../items/ItemList";

export default {
  data: new SlashCommandBuilder()
    .setName("updateshop")
    .setDescription("Update shop items")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Item to change activity of")
        .setRequired(true)
        .addChoices(
          { name: "Mousetrap", value: "mousetrap" },
          { name: "Net", value: "net" },
          { name: "Lasso", value: "lasso" },
          { name: "Beartrap", value: "beartrap" },
          { name: "Safe", value: "safe" },
          { name: "Lucky Shmoin", value: "luckyshmoin" },
          { name: "Shmoizberry", value: "shmoizberry" },
          { name: "all", value: "all" }
        )
    )
    .addBooleanOption((option) =>
      option.setName("activity").setDescription("Status to update to").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const choice = interaction.options.getString("choice")!;
    const activity = interaction.options.getBoolean("activity")!;
    const member = interaction.member as GuildMember;

    if (!member.roles.cache.some((role) => role.name === "Staff")) {
      console.log("No perms");
      await interaction.reply({ embeds: [errorEmbed("You do not have permission!")], ephemeral: true });
      return;
    }

    if (choice === "all") {
      const itemList = getAllItems();
      itemList.forEach((item) => (item.enabled = activity));
      await interaction.reply(`All traps set to ${activity}`);
      return;
    }

    const item = returnItem(choice);
    if (item) {
      item.enabled = activity;
    }
    await interaction.reply(`Updated ${choice} to ${activity}.`);
  },
};
