const { nextPage } = require('../../commands/ViewBox');
module.exports = {
	data: {
		name: 'next_page',
	},
	async execute(interaction) {
		await nextPage(interaction);
	},
};