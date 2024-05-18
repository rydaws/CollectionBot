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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a random number')
        .addIntegerOption((option) => {
        return option.setName('lower').setDescription('Lower number').setRequired(true);
    })
        .addIntegerOption(option => {
        return option.setName('upper')
            .setDescription('The lower bound of your random roll')
            .setRequired(true);
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages),
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const lower = interaction.options.getInteger('lower');
        const upper = interaction.options.getInteger('upper');
        if (!lower || !upper)
            return;
        const roll = Math.floor(Math.random() * (upper - lower + 1)) + lower;
        yield interaction.reply(`Lower bound: ${lower} Upper bound: ${upper} Random roll result: ${roll}`);
    }),
    cooldown: 5
};
exports.default = command;
