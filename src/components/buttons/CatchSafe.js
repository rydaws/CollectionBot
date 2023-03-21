const { catchAttempt } = require('../../commands/catch');
const { safe } = require('../../shop/Traps');
module.exports = {
	data: {
		name: 'catch_safe',
	},
	async execute(interaction) {
		await catchAttempt(interaction, safe);
	},
};