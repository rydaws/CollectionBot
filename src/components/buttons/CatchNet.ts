import { ButtonInteraction } from "discord.js";
import catchCommand from "../../slashCommands/catch";
import { net } from "../../items/Traps";

export default {
  data: { name: "catch_net" },
  async execute(interaction: ButtonInteraction) {
    await catchCommand.catchAttempt(interaction, net);
  },
};
