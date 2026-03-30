import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { setTimeout as wait } from "node:timers/promises";

// Test command - uses external joke API
export default {
  data: new SlashCommandBuilder().setName("dadjoke").setDescription("Tells a dad joke"),
  async execute(interaction: ChatInputCommandInteraction) {
    const data = await getData();
    await interaction.reply(data.body[0].setup);
    await wait(4000);
    await interaction.editReply(data.body[0].punchline);
  },
};

async function getData() {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY ?? "",
      "X-RapidAPI-Host": "dad-jokes.p.rapidapi.com",
    },
  };
  const res = await fetch("https://dad-jokes.p.rapidapi.com/random/joke", options);
  return res.json();
}
