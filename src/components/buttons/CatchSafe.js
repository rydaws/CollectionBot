const { catchAttempt } = require('../../commands/catch');
const { safe } = require('../../monsters/CatchingGear');
module.exports = {
	data: {
		name: 'catch_safe',
	},
	async execute(interaction) {
		await catchAttempt(interaction, safe);
	},
};