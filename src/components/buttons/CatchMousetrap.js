const { catchAttempt } = require('../../commands/catch');
const { mousetrap } = require('../../monsters/CatchingGear');
module.exports = {
	data: {
		name: 'catch_mousetrap',
	},
	async execute(interaction) {
		await catchAttempt(interaction, mousetrap);
	},
};