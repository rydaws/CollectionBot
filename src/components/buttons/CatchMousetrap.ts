import { ButtonInteraction } from "discord.js";
import catchCommand from "../../slashCommands/catch";
import { mousetrap } from "../../items/Traps";

export default {
  data: { name: "catch_mousetrap" },
  async execute(interaction: ButtonInteraction) {
    await catchCommand.catchAttempt(interaction, mousetrap);
  },
};
