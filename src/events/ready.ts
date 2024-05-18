import { Client } from "discord.js";
import { BotEvent } from "../types";

const event : BotEvent = {
	name: "ready",
	once: true,
	execute(client: Client) {
		if (client.user) {
			console.log(`[Ready] Ready! Logged in as ${client.user.tag}`);
			client.user.setActivity('I love Franklin-stein');
		}
	},
};

export default event;