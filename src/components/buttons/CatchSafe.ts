import { ButtonInteraction } from "discord.js";
import catchCommand from "../../slashCommands/catch";
import { safe } from "../../items/Traps";

export default {
  data: { name: "catch_safe" },
  async execute(interaction: ButtonInteraction) {
    await catchCommand.catchAttempt(interaction, safe);
  },
};
