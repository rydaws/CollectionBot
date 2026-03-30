import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { deploy } from "./deploy-commands";

const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;

config();

const client = new Client({ intents: [Guilds, MessageContent, GuildMessages, GuildMembers] });

// Deploy slash commands
deploy();

// Load events
const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = require(filePath);
  const evt = event.default ?? event;
  if (evt.once) {
    client.once(evt.name, (...args: any[]) => evt.execute(...args));
  } else {
    client.on(evt.name, (...args: any[]) => evt.execute(...args));
  }
}

// Load slash commands
const commandsPath = join(__dirname, "slashCommands");
const commandFiles2 = readdirSync(commandsPath).filter(
  (file) => (file.endsWith(".js") || file.endsWith(".ts")) && !file.startsWith(".")
);

for (const file of commandFiles2) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  const cmd = command.default ?? command;
  if ("data" in cmd && "execute" in cmd) {
    client.commands.set(cmd.data.name, cmd);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load staff commands
const staffCommandsPath = join(__dirname, "slashCommands/staff");
const staffCommandFiles = readdirSync(staffCommandsPath).filter(
  (file) => file.endsWith(".js") || file.endsWith(".ts")
);

for (const file of staffCommandFiles) {
  const filePath = join(staffCommandsPath, file);
  const command = require(filePath);
  const cmd = command.default ?? command;
  if ("data" in cmd && "execute" in cmd) {
    client.commands.set(cmd.data.name, cmd);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load button components
const buttonsPath = join(__dirname, "./components/buttons");
const buttonFiles = readdirSync(buttonsPath).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of buttonFiles) {
  const filePath = join(buttonsPath, file);
  const button = require(filePath);
  const btn = button.default ?? button;
  if ("data" in btn && "execute" in btn) {
    client.commands.set(btn.data.name, btn);
  } else {
    console.log(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

client.login(process.env.DISCORD_TOKEN);
