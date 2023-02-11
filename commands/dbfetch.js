const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let res;
let user;
let name;
let className;
let type;
let rarity;
let level;

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
		console.log(user.username);
		console.log(user.avatarURL());
		await connectDb(id);
		const em = await createEmbed();
		// await interaction.reply(`Name: ${name} Type: ${type} Level: ${level}`);
		await interaction.reply({ embeds: [em] });
	},
};

const connectDb = async (id) => {
	try {
		const client = new Client({
			user: process.env.PGUSER,
			host: process.env.PGHOST,
			database: process.env.PGDATABASE,
			password: process.env.PGPASSWORD,
			port: process.env.PGPORT,
		});

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
		level = res.rows[0].level;
		console.log(res);
		console.log('Returning display name: ' + name);
		console.log('Returning type: ' + type);
		console.log('Returning level: ' + level);
		await client.end();
		await createEmbed();
	}
	catch (error) {
		console.log(error);
	}
};

function createEmbed() {
	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Queried Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription('Stats for the monster')
		.setThumbnail(user.avatarURL())
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
			{ name: 'Level', value: `${level}`, inline: true },
		)
		// .setImage('https://i.imgur.com/UfNVa3J.jpeg')
		.setTimestamp()
		.setFooter({ text: 'Some footer text here' });
	return embed;
}

function createErrorEmbed() {
	const embed = new EmbedBuilder()
		.setTitle('Error!')
		.setDescription('Monster not found! Is the ID right?');
	return embed;
}