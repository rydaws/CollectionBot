const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dadjoke')
		.setDescription('Tells a dad joke'),


	async execute(interaction) {

		const data = await getData();
		console.log(data.body[0].setup);
		console.log(data.body[0].punchline);

		await interaction.reply(data.body[0].setup);
		await wait(2000);
		await interaction.editReply(data.body[0].punchline);
	},
};

async function getData() {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '2da3766b95msh2139338b76a7610p16db86jsn0dea0c0042f2',
			'X-RapidAPI-Host': 'dad-jokes.p.rapidapi.com'
		},
	};
	const res = await fetch('https://dad-jokes.p.rapidapi.com/random/joke', options);
	return res.json();
}