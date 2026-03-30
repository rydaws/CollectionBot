import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { errorEmbed, textEmbed } from "../util/EmbedUtil";
import { Commands } from "../CommandList";
import prisma from "../util/prisma";

const QUEST_LENGTH_MINUTES = 2;

export default {
  data: new SlashCommandBuilder()
    .setName("quest")
    .setDescription("Send your team of monsters out on a quest!")
    .addSubcommand((subcommand) =>
      subcommand.setName("status").setDescription("View your current quest's status")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("start").setDescription("Set out on your quest with your current team.")
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const userId = BigInt(user.id);

    const team = await prisma.box.findMany({
      where: { client_id: userId, active: true },
      include: { monsters: true },
    });

    if (team.length === 0) {
      await interaction.reply({
        embeds: [errorEmbed(`Your team is empty! Use ${Commands.team[0]} to add members to your team.`)],
      });
      console.log(`[Quest | ERROR] - ${user.username}'s team is empty`);
      return;
    }

    const deployments = await prisma.deployments.findMany({
      where: { client_id: userId },
    });

    const chosenSubcommand = interaction.options.getSubcommand();

    switch (chosenSubcommand) {
      case "status": {
        if (deployments.length === 0) {
          await interaction.reply({
            embeds: [textEmbed(`You have no active quests! Use ${Commands.quest[1]} to set out on a quest!`)],
          });
          console.log(`[Quest] - ${user.username} has no active quest.`);
          return;
        }

        const firstDeployment = deployments[0];
        const now = new Date();
        const endTime = firstDeployment.end_time;

        if (endTime && endTime < now) {
          // Quest ended - give XP rewards
          const experienceToGive = Math.floor(Math.random() * (150 - 50 + 1) + 50);
          const col: string[] = [];

          for (const member of team) {
            const currentXp = member.xp + experienceToGive;
            const xpRequired = calculateExperienceRequired(member.level);

            if (currentXp >= xpRequired) {
              const newLevel = member.level + 1;
              const newXpRequired = calculateExperienceRequired(newLevel);
              col.push(`⏫ **${member.monsters.display_name}** has leveled up to Lv \`${newLevel}\`!\n`);

              await prisma.box.update({
                where: { client_id_id: { client_id: userId, id: member.id } },
                data: { level: newLevel, xp: 0, xp_required: newXpRequired },
              });
              console.log(`[Quest] - ${member.monsters.display_name} leveled up to ${newLevel} for ${user.username}`);
            } else {
              col.push(`🔼 **${member.monsters.display_name}** has gained \`${experienceToGive}\` XP!\n`);

              await prisma.box.update({
                where: { client_id_id: { client_id: userId, id: member.id } },
                data: { xp: currentXp, xp_required: xpRequired },
              });
              console.log(`[Quest] - ${member.monsters.display_name} gained ${experienceToGive} XP for ${user.username}`);
            }
          }

          await prisma.deployments.deleteMany({ where: { client_id: userId } });

          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Quest results")
            .setAuthor({ name: `${user.username}'s team`, iconURL: user.avatarURL()! })
            .setTimestamp();
          embed.addFields({ name: " ", value: col.join(""), inline: true });

          await interaction.reply({ embeds: [embed] });
        } else {
          // Quest still active
          const timeLeft = endTime ? endTime.getTime() - now.getTime() : 0;
          const minutesLeft = Math.ceil(timeLeft / 60000);
          await interaction.reply({
            embeds: [textEmbed(`You have a quest active that has ${minutesLeft} minute(s) left`)],
          });
        }
        break;
      }

      case "start": {
        if (deployments.length > 0) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                `You can only have 1 active quest! Check your current quest status with ${Commands.quest[0]}.`
              ),
            ],
          });
          return;
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + QUEST_LENGTH_MINUTES * 60000);

        await prisma.deployments.createMany({
          data: team.map((member) => ({
            client_id: userId,
            id: member.id,
            start_time: now,
            end_time: endTime,
          })),
        });

        console.log(`[Quest] - Quest started for user ${user.username} which will end in ${QUEST_LENGTH_MINUTES} minutes`);

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle("Quest started!")
          .setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL()! })
          .setDescription(
            `Your quest will be done in ${QUEST_LENGTH_MINUTES} minutes, check its status with ${Commands.quest[0]}`
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  },
};

function calculateExperienceRequired(currentLevel: number) {
  return currentLevel * currentLevel * 100;
}
