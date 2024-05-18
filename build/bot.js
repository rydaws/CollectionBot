"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
// Require the necessary discord.js classes
const discord_js_1 = require("discord.js");
const { Guilds, MessageContent, GuildMessages, GuildMembers } = discord_js_1.GatewayIntentBits;
const dotenv_1 = require("dotenv");
const node_path_2 = __importDefault(require("node:path"));
const { deploy } = require("./deploy-commands");
// Create a new client instance
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const client = new discord_js_1.Client({ intents: [Guilds, MessageContent, GuildMessages, GuildMembers] });
const eventsPath = node_path_2.default.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
// Deploys slashCommands
(0, dotenv_1.config)();
deploy();
for (const file of eventFiles) {
    const filePath = (0, node_path_1.join)(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
// Fetches regular slashCommands
const commandsPath = (0, node_path_1.join)(__dirname, "commands");
const commandFiles = (0, node_fs_1.readdirSync)(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commandFiles) {
    const filePath = (0, node_path_1.join)(commandsPath, file);
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
const staffCommandsPath = (0, node_path_1.join)(__dirname, "slashCommands/staff");
const staffCommandFiles = (0, node_fs_1.readdirSync)(staffCommandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of staffCommandFiles) {
    const filePath = (0, node_path_1.join)(staffCommandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
const buttonsPath = (0, node_path_1.join)(__dirname, "./components/buttons");
const buttonFiles = (0, node_fs_1.readdirSync)(buttonsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of buttonFiles) {
    const filePath = (0, node_path_1.join)(buttonsPath, file);
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
