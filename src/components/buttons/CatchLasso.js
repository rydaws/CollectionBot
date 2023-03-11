const { catchAttempt } = require('../../commands/catch');
const { lasso } = require('../../shop/CatchingGear');
module.exports = {
	data: {
		name: 'catch_lasso',
	},
	async execute(interaction) {
		await catchAttempt(interaction, lasso);
	},
};