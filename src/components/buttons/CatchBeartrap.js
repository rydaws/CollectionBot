const { catchAttempt } = require('../../commands/catch');
const { beartrap } = require('../../shop/CatchingGear');
module.exports = {
	data: {
		name: 'catch_beartrap',
	},
	async execute(interaction) {
		await catchAttempt(interaction, beartrap);
	},
};