const { nextPage } = require('../../slashCommands/ViewBox');
module.exports = {
	data: {
		name: 'next_page',
	},
	async execute(interaction) {
		await nextPage(interaction);
	},
};