const { catchAttempt } = require('../../commands/catch');
const { lasso } = require('../../items/Traps');
module.exports = {
	data: {
		name: 'catch_lasso',
	},
	async execute(interaction) {
		await catchAttempt(interaction, lasso);
	},
};