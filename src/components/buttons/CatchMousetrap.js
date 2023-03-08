const { catchMousetrap } = require('../../commands/catch');
module.exports = {
	data: {
		name: 'next_page',
	},
	async execute(interaction) {
		await catchMousetrap(interaction);
	},
};