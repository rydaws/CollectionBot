const { EmbedBuilder } = require('discord.js');
function monsterEmbed(user, res) {
	console.log('[DisplayMonster] Starts embed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription('Stats for the monster')
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		.setTimestamp();
	// .setFooter({ text: 'Click options below to capture!' });
}

function showMonsterEmbed(user, res, level) {
	console.log('[DisplayMonster] Starts showMonsterEmbed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`${name}`)
		// .setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription(`Owned by ${user.username}`)
		.addFields(
			{ name: 'Level', value: `${level}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
			// TODO maybe change to include 'Obtained: TIME'
		)
		.setImage(img)
		.setTimestamp();
	// .setFooter({ text: `Owned by: ${user.username}`, iconURL: user.avatarURL() });
	// TODO maybe do OBTAINED AT
}

function runaway(user, res) {
	console.log('[RunAwayEmbed] Monster ran away');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x000000)
		.setAuthor({ name: 'The Monster ran away!', iconURL: 'https://collection-monsters.s3.amazonaws.com/runaway.png' })
		.setDescription(`**${name}** ran away, ${user.username}!`)
		.addFields(
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },

		)
		.setThumbnail(img);
}

function catchEmbed(user, res) {
	console.log('[CatchEmbed] Starting catch game display...');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x0099FF)
		// .setTitle('A Monster appeared!')
		.setAuthor({ name: 'A Monster appeared!', iconURL: 'https://collection-monsters.s3.amazonaws.com/tallgrass.png' })
		.setDescription('Click any of the options below to try and catch it!')
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		.setTimestamp();
}

function errorEmbed(description) {
	return new EmbedBuilder()
		.setColor(0xFE514E)
		.setTitle('Error')
		.setDescription(description)
		.setTimestamp();
}

function textEmbed(description) {
	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Information')
		.setDescription(description)
		.setTimestamp();
}

module.exports = {
	monsterEmbed,
	showMonsterEmbed,
	runaway,
	catchEmbed,
	errorEmbed,
	textEmbed,
};
