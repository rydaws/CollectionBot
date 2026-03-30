import { ButtonInteraction } from "discord.js";
import viewBox from "../../slashCommands/ViewBox";

export default {
  data: { name: "next_page" },
  async execute(interaction: ButtonInteraction) {
    await viewBox.nextPage(interaction);
  },
};
