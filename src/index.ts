import { Client, GatewayIntentBits, Collection } from "discord.js";
import { Command, SlashCommand } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";

const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;
config();

const client = new Client({ intents: [Guilds, MessageContent, GuildMessages, GuildMembers] });

client.slashCommands = new Collection<string, SlashCommand>();
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, "./handlers");
readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js")) return;
  require(`${handlersDir}/${handler}`)(client);
});

client.login(process.env.DISCORD_TOKEN);
