import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "node:fs";
import { join } from "node:path";

config();

const commands: any[] = [];

const commandsDir = join(__dirname, "slashCommands");
const commandFiles = readdirSync(commandsDir).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of commandFiles) {
  const command = require(join(commandsDir, file));
  const cmd = command.default ?? command;
  if (cmd.data) {
    commands.push(cmd.data.toJSON());
  }
}

const staffDir = join(__dirname, "slashCommands/staff");
const staffFiles = readdirSync(staffDir).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of staffFiles) {
  const command = require(join(staffDir, file));
  const cmd = command.default ?? command;
  if (cmd.data) {
    commands.push(cmd.data.toJSON());
  }
}

export async function deploy() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data: any = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}
