const { catchAttempt } = require('../../commands/catch');
const { net } = require('../../items/Traps');
module.exports = {
	data: {
		name: 'catch_net',
	},
	async execute(interaction) {
		await catchAttempt(interaction, net);
	},
};