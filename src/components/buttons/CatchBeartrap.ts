import { ButtonInteraction } from "discord.js";
import catchCommand from "../../slashCommands/catch";
import { beartrap } from "../../items/Traps";

export default {
  data: { name: "catch_beartrap" },
  async execute(interaction: ButtonInteraction) {
    await catchCommand.catchAttempt(interaction, beartrap);
  },
};
