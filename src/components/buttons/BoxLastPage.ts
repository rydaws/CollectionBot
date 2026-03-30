import { ButtonInteraction } from "discord.js";
import viewBox from "../../slashCommands/ViewBox";

export default {
  data: { name: "last_page" },
  async execute(interaction: ButtonInteraction) {
    await viewBox.lastPage(interaction);
  },
};
