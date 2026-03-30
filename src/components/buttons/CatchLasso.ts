import { ButtonInteraction } from "discord.js";
import catchCommand from "../../slashCommands/catch";
import { lasso } from "../../items/Traps";

export default {
  data: { name: "catch_lasso" },
  async execute(interaction: ButtonInteraction) {
    await catchCommand.catchAttempt(interaction, lasso);
  },
};
