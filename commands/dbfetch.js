const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let res;
let name;
let type;
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

		await connectDb(id);
		const em = await createEmbed();
		//await interaction.reply(`Name: ${name} Type: ${type} Level: ${level}`);
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
			port: process.env.PGPORT
		});

		await client.connect();
		res = await client.query(`SELECT * FROM monsters WHERE id=${id}`);
		name = res.rows[0].display_name;
		type = res.rows[0].type;
		level = res.rows[0].level;
		console.log(res);
		console.log('Returning display name: ' + name);
		console.log('Returning type: ' + type);
		console.log('Returning level: ' + level);
		await client.end();
	}
	catch (error) {
		console.log(error);
	}
};

function createEmbed() {
	const exampleEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Queried Monster')
		.setAuthor({ name: 'Eavan', iconURL: 'https://rdawson.s3.amazonaws.com/austin.jpeg' })
		.setDescription('Stats for the monster')
		.setThumbnail('https://i.imgur.com/UfNVa3J.jpeg')
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Level', value: `${level}`, inline: true },
		)
		.setImage('https://i.imgur.com/UfNVa3J.jpeg')
		.setTimestamp()
		.setFooter({ text: 'Some footer text here' });
	return exampleEmbed;
}