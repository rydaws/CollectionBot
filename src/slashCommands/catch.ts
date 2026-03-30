import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
} from "discord.js";
import { catchEmbed, errorEmbed, runaway, badCatch, successCatch } from "../util/EmbedUtil";
import { Commands } from "../CommandList";
import { monsters } from "../monsters/MonsterDetails";
import { mousetrap, net, lasso, beartrap, safe } from "../items/Traps";
import { luckyshmoin, shmoizberry } from "../items/Amplifiers";
import { Trap, MonsterStatistics } from "../lib/types/global";
import prisma from "../util/prisma";

interface CatchState {
  monster: any;
  caughtRarity: MonsterStatistics;
  backpack: any;
  ownerId: string;
  timeoutId: NodeJS.Timeout;
}

// Per-user state for active catch interactions
const catchStates = new Map<string, CatchState>();

export default {
  data: new SlashCommandBuilder().setName("catch").setDescription("Encounter a monster and attempt to capture it!"),
  async execute(interaction: ChatInputCommandInteraction) {
    const ownerId = interaction.user.id;
    await catchEvent(interaction, ownerId);
  },

  async catchAttempt(interaction: ButtonInteraction, device: Trap) {
    const state = catchStates.get(interaction.user.id);
    if (!state) return;

    clearTimeout(state.timeoutId);

    if (interaction.user.id !== state.ownerId) {
      console.log(
        `[Catch | ERROR] - Button client: ${interaction.user.id} does not equal embed client: ${state.ownerId}`
      );
      return;
    }

    const randomRoll = Math.random() * 100;

    let catchAmp = 0;
    if (state.backpack.shmoizberry !== 0) {
      catchAmp = shmoizberry.property * state.backpack.shmoizberry;
    }

    console.log("[Catch] - Roll", randomRoll);
    console.log("[Catch] - Catch rate", state.caughtRarity.catchRate);
    console.log("[Catch] - Device catch rate", device.catchRate);
    console.log("[Catch] - Catch amp", catchAmp);

    const totalCatchRate = state.caughtRarity.catchRate + device.catchRate + catchAmp;
    console.log("[Catch] - Total catch rate", totalCatchRate);

    try {
      if (randomRoll <= totalCatchRate) {
        await prisma.box.create({
          data: { client_id: BigInt(state.ownerId), id: state.monster.id, level: 1 },
        });
        console.log(`[Catch] - Added ${state.monster.id} to ${interaction.user.username}'s box`);

        let shmoinAmplifier = 1;
        if (state.backpack.luckyshmoin !== 0) {
          shmoinAmplifier = (1 + luckyshmoin.property) * state.backpack.luckyshmoin;
        }

        console.log("[Catch] - Shmoin Amp", shmoinAmplifier);
        const shmoinsToAdd = Math.floor(Math.random() * (250 - 125 + 1) + 125 * state.caughtRarity.shmoinMulti * shmoinAmplifier);

        await prisma.backpack.update({
          where: { client_id: BigInt(state.ownerId) },
          data: {
            [device.name]: { decrement: 1 },
            shmoins: { increment: shmoinsToAdd },
          },
        });
        console.log(`[Catch] - Deducted 1 ${device.name} from client ${interaction.user.username}`);
        console.log(`[Catch] - Added ${shmoinsToAdd} to client ${interaction.user.username}`);

        await interaction.update({
          content: " ",
          embeds: [successCatch(interaction.user, state.monster, shmoinsToAdd)],
          components: [],
        });
      } else {
        console.log(`[Catch] - Catch failed for ${state.ownerId}`);
        await interaction.update({
          content: " ",
          embeds: [badCatch(interaction.user, state.monster)],
          components: [],
        });
      }
    } catch (e) {
      console.log(`[Catch | ERROR] - Failed to catch monster for ${interaction.user.username}.`);
      await interaction.followUp({ embeds: [errorEmbed("Error! Please contact staff if this issue persists")] });
    }

    catchStates.delete(state.ownerId);
  },
};

async function catchEvent(interaction: ChatInputCommandInteraction, ownerId: string) {
  console.log(`[Catch] - Begin Catch Event for ${ownerId}`);

  try {
    // Get IDs the user already owns
    const ownedEntries = await prisma.box.findMany({
      where: { client_id: BigInt(ownerId) },
      select: { id: true },
    });
    const ownedIds = ownedEntries.map((b) => b.id);

    // Get distinct rarities of unowned monsters
    const availableMonsters = await prisma.monsters.findMany({
      where: { id: { notIn: ownedIds } },
      distinct: ["rarity"],
      select: { rarity: true },
      orderBy: { rarity: "asc" },
    });

    const pRarity = availableMonsters.map((m) => m.rarity);
    console.log("[Catch] - Potential rarities... ", pRarity);

    // Filter monster rarities to only available ones
    const availableRarities = monsters.filter((mon) => pRarity.includes(mon.rarity));

    if (availableRarities.length === 0) {
      await interaction.reply({
        embeds: [errorEmbed(`You already own all monsters! Focus on training them with ${Commands.quest}`)],
      });
      return;
    }

    // Roll for rarity
    const totalEncounterRate = availableRarities.reduce((sum, monster) => sum + monster.encounterRate, 0);
    let randomRoll = Math.floor(Math.random() * totalEncounterRate) + 1;

    let caughtRarity: MonsterStatistics | undefined;
    for (const mon of availableRarities) {
      if (randomRoll <= mon.encounterRate) {
        caughtRarity = mon;
        break;
      }
      randomRoll -= mon.encounterRate;
    }

    if (!caughtRarity) return;
    console.log(`[Catch] - Rarity ${caughtRarity.rarity} chosen.`);

    // Select a random unowned monster of that rarity
    const potentialMonsters = await prisma.monsters.findMany({
      where: { id: { notIn: ownedIds }, rarity: caughtRarity.rarity },
    });

    if (potentialMonsters.length === 0) {
      console.log(`[Catch | ERROR] Client ${ownerId} owns all monsters.`);
      await interaction.reply({
        embeds: [errorEmbed(`You already own all monsters! Focus on training them with ${Commands.quest}`)],
      });
      return;
    }

    const monster = potentialMonsters[Math.floor(Math.random() * potentialMonsters.length)];

    // Fetch backpack
    const backpack = await prisma.backpack.findUnique({
      where: { client_id: BigInt(ownerId) },
    });

    if (!backpack) {
      await interaction.reply({ embeds: [errorEmbed("You need to /start first!")] });
      return;
    }

    console.log(`[Catch] - Monster ${monster.display_name} appeared for user ${ownerId}`);

    // Store state for this catch interaction
    const timeoutId = setTimeout(async () => {
      catchStates.delete(ownerId);
      await interaction.editReply({
        content: "The monster ran away!",
        embeds: [runaway(interaction.user, monster)],
        components: [],
      });
    }, 5000);

    catchStates.set(ownerId, { monster, caughtRarity, backpack, ownerId, timeoutId });

    const msg = "Click any of the options at the bottom to attempt capture!";
    await interaction.reply({
      content: msg,
      embeds: [catchEmbed(interaction.user, monster)],
      components: [createButtons(backpack)],
    });
  } catch (e) {
    console.log(`[Catch | ERROR] - Error during catch event for ${ownerId}`);
    catchStates.delete(ownerId);
  }
}

function createButtons(backpack: any) {
  const buttons = new ActionRowBuilder<ButtonBuilder>();

  if (backpack.mousetrap > 0) {
    buttons.addComponents(
      new ButtonBuilder().setCustomId("catch_mousetrap").setStyle(ButtonStyle.Secondary).setEmoji(mousetrap.emoji)
    );
  }
  if (backpack.net > 0) {
    buttons.addComponents(
      new ButtonBuilder().setCustomId("catch_net").setStyle(ButtonStyle.Secondary).setEmoji(net.emoji)
    );
  }
  if (backpack.lasso > 0) {
    buttons.addComponents(
      new ButtonBuilder().setCustomId("catch_lasso").setStyle(ButtonStyle.Secondary).setEmoji(lasso.emoji)
    );
  }
  if (backpack.beartrap > 0) {
    buttons.addComponents(
      new ButtonBuilder().setCustomId("catch_beartrap").setStyle(ButtonStyle.Secondary).setEmoji(beartrap.emoji)
    );
  }
  if (backpack.safe > 0) {
    buttons.addComponents(
      new ButtonBuilder().setCustomId("catch_safe").setStyle(ButtonStyle.Secondary).setEmoji(safe.emoji)
    );
  }

  return buttons;
}
