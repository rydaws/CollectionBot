const { SlashCommandBuilder } = require('discord.js');
const { con } = require('../db');
const { Client } = require('pg');

let res;
let name;
let type;
let level;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Creates profile for user'),
	async execute(interaction) {

		const client = new Client(con);
		await client.connect();
		res = await client.query('SELECT * FROM monsters WHERE id=1');

		name = res.rows[0].display_name;
		type = res.rows[0].type;
		level = res.rows[0].level;
		console.log(res);
		console.log('Returning display name: ' + name);
		console.log('Returning type: ' + type);
		console.log('Returning level: ' + level);


		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
		client.end();

	},
};