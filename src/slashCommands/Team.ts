import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed } from "../util/EmbedUtil";
import { Commands } from "../CommandList";
import prisma from "../util/prisma";

const TEAM_SIZE = 4;

export default {
  data: new SlashCommandBuilder()
    .setName("team")
    .setDescription("Manage your team for quests")
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View your current quest's status."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add monsters to your team.")
        .addStringOption((name) =>
          name.setName("name").setDescription("Name of monster to add to your team").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove monsters from your team")
        .addStringOption((name) =>
          name.setName("name").setDescription("Name of monster to remove from your team").setRequired(true)
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const targetName = interaction.options.getString("name");
    const chosenSubcommand = interaction.options.getSubcommand();
    let replied = false;

    try {
      const allOwned = await prisma.box.findMany({
        where: { client_id: BigInt(user.id) },
        include: { monsters: true },
      });

      let activeTeam = await prisma.box.findMany({
        where: { client_id: BigInt(user.id), active: true },
        include: { monsters: true },
        orderBy: { id: "asc" },
      });

      const teamNames = activeTeam.map((m) => m.monsters.display_name);

      if (chosenSubcommand === "add" && targetName) {
        if (activeTeam.length >= TEAM_SIZE) {
          console.log(`[Team | ERROR] - User ${user.username}'s team is full!`);
          await interaction.reply({ embeds: [errorEmbed("Team is full! Cannot add another member")] });
          return;
        }

        if (teamNames.includes(targetName)) {
          console.log(`[Team | ERROR] - User ${user.username}'s team already has this member!`);
          await interaction.reply({
            embeds: [errorEmbed("Team already has this member! Try adding a different one.")],
          });
          return;
        }

        const owned = allOwned.find((m) => m.monsters.display_name === targetName);
        if (!owned) {
          console.log(`[Team | ERROR] - User ${user.username} does not own monster ${targetName}`);
          await interaction.reply({
            embeds: [
              errorEmbed(
                `You do not own that monster or spelling is wrong, (CaSe SeNsItIvE)! View your monsters with ${Commands.box}`
              ),
            ],
          });
          return;
        }

        console.log(`[Team] - Adding ${targetName} to ${user.username}'s active team.`);
        await prisma.box.update({
          where: { client_id_id: { client_id: BigInt(user.id), id: owned.id } },
          data: { active: true },
        });
      } else if (chosenSubcommand === "remove" && targetName) {
        if (!teamNames.includes(targetName)) {
          await interaction.reply({
            embeds: [errorEmbed(`Your team has no such member! Start by using ${Commands.team[0]}`)],
          });
          return;
        }

        const member = activeTeam.find((m) => m.monsters.display_name === targetName);
        if (member) {
          console.log(`[Team] - Removing ${targetName} from ${user.username}'s active team.`);
          await prisma.box.update({
            where: { client_id_id: { client_id: BigInt(user.id), id: member.id } },
            data: { active: false },
          });
        }
      } else {
        console.log(`[Team] - Viewing ${user.username}'s active team.`);
      }

      // Re-fetch active team after changes
      activeTeam = await prisma.box.findMany({
        where: { client_id: BigInt(user.id), active: true },
        include: { monsters: true },
        orderBy: { id: "asc" },
      });

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Your team")
        .setAuthor({ name: `${user.username}'s team`, iconURL: user.avatarURL()! })
        .setTimestamp();

      const col: string[] = [];
      activeTeam.forEach((member) => {
        col.push(
          `✅ \`${member.id}\` ${member.monsters.display_name} Lv: \`${member.level}\` XP: ${member.xp}/${member.xp_required}\n`
        );
      });

      for (let i = 0; i < TEAM_SIZE - activeTeam.length; i++) {
        col.push("❌ Slot empty!\n");
      }

      embed.addFields({ name: " ", value: col.join(""), inline: true });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      if (!replied) {
        await interaction.reply({
          embeds: [errorEmbed(`Try ${Commands.start} and if issue persists, contact staff.`)],
        });
      }
    }
  },
};
