import { readdirSync } from "node:fs";
import { join } from "node:path";
// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits } from "discord.js";
const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits

import { config } from "dotenv";
import path from "node:path";
const { deploy } = require("./deploy-commands")
// Create a new client instance
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const client = new Client({intents:[Guilds, MessageContent, GuildMessages, GuildMembers]})

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: any) => file.endsWith('.js'));

// Deploys slashCommands
config();

deploy();

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


// Fetches regular slashCommands
const commandsPath = join(__dirname, "commands");
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Fetches Staff slashCommands
const staffCommandsPath = join(__dirname, "slashCommands/staff");
const staffCommandFiles = readdirSync(staffCommandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of staffCommandFiles) {
	const filePath = join(staffCommandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


const buttonsPath = join(__dirname, "./components/buttons");
const buttonFiles = readdirSync(buttonsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of buttonFiles) {
	const filePath = join(buttonsPath, file);
	const button = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in button && 'execute' in button) {
		client.commands.set(button.data.name, button);
	}
	else {
		console.log(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// client.ComponentListener();
// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);