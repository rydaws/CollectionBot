const { catchAttempt } = require('../../commands/catch');
const { safe } = require('../../shop/CatchingGear');
module.exports = {
	data: {
		name: 'catch_safe',
	},
	async execute(interaction) {
		await catchAttempt(interaction, safe);
	},
};