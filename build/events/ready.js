"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event = {
    name: "ready",
    once: true,
    execute(client) {
        if (client.user) {
            console.log(`[Ready] Ready! Logged in as ${client.user.tag}`);
            client.user.setActivity('I love Franklin-stein');
        }
    },
};
exports.default = event;
