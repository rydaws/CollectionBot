const { catchAttempt } = require('../../commands/catch');
const { net } = require('../../monsters/CatchingGear');
module.exports = {
	data: {
		name: 'catch_net',
	},
	async execute(interaction) {
		await catchAttempt(interaction, net);
	},
};