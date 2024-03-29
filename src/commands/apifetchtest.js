const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dadjoke')
		.setDescription('Tells a dad joke'),


	async execute(interaction) {

		const data = await getData();

		await interaction.reply(data.body[0].setup);
		await wait(4000);
		await interaction.editReply(data.body[0].punchline);
	},
};

async function getData() {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '2da3766b95msh2139338b76a7610p16db86jsn0dea0c0042f2',
			'X-RapidAPI-Host': 'dad-jokes.p.rapidapi.com',
		},
	};
	const res2 = await fetch('https://dad-jokes.p.rapidapi.com/random/joke', options);

	// eslint-disable-next-line no-unused-vars
	let res;
	await fetch('https://dummyjson.com/products')
		.then(response => response.json())
		.then(json => {
			res = json;
		});
	// console.log(res.products[0].title);

	return res2.json();
}