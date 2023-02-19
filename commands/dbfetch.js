const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
const { con } = require('../db');
const dotenv = require('dotenv');
dotenv.config();

let res;
let user;
let name;
let className;
let type;
let rarity;
let img;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('Fetch monster from db by id')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The id of the monster')
				.setRequired(true)),

	async execute(interaction) {
		const id = interaction.options.getInteger('id');
		user = interaction.user;
		await connectDb(id);
		const em = await createEmbed();
		// await interaction.reply(`Name: ${name} Type: ${type} Level: ${level}`);
		await interaction.reply({ embeds: [em] });
	},
};

const connectDb = async (id) => {

	// TODO remake with generalized connection seen in 'db.js'

	try {
		const client  = new Client(con);

		await client.connect();
		try {
			res = await client.query(`SELECT * FROM monsters WHERE id=${id}`);
		}
		catch (e) {
			await createErrorEmbed();
		}
		name = res.rows[0].display_name;
		className = res.rows[0].class;
		type = res.rows[0].type;
		rarity = res.rows[0].rarity;
		img = res.rows[0].img;
		console.log('Returning display name: ' + name);
		console.log('Returning type: ' + type);
		await client.end();
	}
	catch (error) {
		console.log(error);
	}
};

function createEmbed() {
	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Queried Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription('Stats for the monster')
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		// .setImage('https://collection-monsters.s3.amazonaws.com/the-dogAvatar.png')
		.setTimestamp()
		.setFooter({ text: 'Click options below to capture!' });
}

function createErrorEmbed() {
	return new EmbedBuilder()
		.setTitle('Error!')
		.setDescription('Monster not found! Is the ID right?');
}