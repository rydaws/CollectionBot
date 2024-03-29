const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const { deploy } = require('./deploy-commands');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Deploys commands
dotenv.config();

deploy();

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();

// Fetches regular commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Fetches Staff commands
const staffCommandsPath = path.join(__dirname, 'commands/staff');
const staffCommandFiles = fs.readdirSync(staffCommandsPath).filter(file => file.endsWith('.js'));

for (const file of staffCommandFiles) {
	const filePath = path.join(staffCommandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.buttons = new Collection();

const buttonsPath = path.join(__dirname, './components/buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
	const filePath = path.join(buttonsPath, file);
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