const { readdirSync } = require('./CollectionBot/components');

module.exports = (client) => {
	client.handleComponents = async () => {
		const componentFolder = readdirSync('')
	}
}