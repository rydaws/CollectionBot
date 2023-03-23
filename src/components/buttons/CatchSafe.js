const { catchAttempt } = require('../../commands/catch');
const { safe } = require('../../items/Traps');
module.exports = {
	data: {
		name: 'catch_safe',
	},
	async execute(interaction) {
		await catchAttempt(interaction, safe);
	},
};