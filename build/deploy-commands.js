"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const commands = [];
// Grab all the command files from the slashCommands directory you created earlier
const commandFiles = fs.readdirSync('./slashCommands').filter((file) => file.endsWith('.js'));
const staffCommandFiles = fs.readdirSync('./slashCommands/staff').filter((file) => file.endsWith('.js'));
dotenv.config();
module.exports = {
    deploy() {
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }
        for (const file of staffCommandFiles) {
            const staffCommand = require(`./commands/staff/${file}`);
            commands.push(staffCommand.data.toJSON());
        }
        // Construct and prepare an instance of the REST module
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        // and deploy your slashCommands!
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);
                // The put method is used to fully refresh all slashCommands in the guild with the current set
                const data = yield rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            }
            catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        }))();
    },
};
