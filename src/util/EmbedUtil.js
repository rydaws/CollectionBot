const { EmbedBuilder } = require('discord.js');
const { fetchMonsterDetails } = require('../monsters/MonsterDetails');
function monsterEmbed(user, res) {
	console.log('[DisplayMonster] Starts embed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(fetchMonsterDetails(rarity).color)
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
}

function showMonsterEmbed(user, res, level) {
	console.log('[DisplayMonster] Starts showMonsterEmbed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
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
		.setColor(fetchMonsterDetails(rarity).color)
		.setTimestamp()
		.setFooter({ text: `Owned by: ${user.username}`, iconURL: user.avatarURL() });
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

function badCatch(user, res) {
	console.log('[BadCatchEmbed] Monster broke free and ran away');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0xC70039)
		.setAuthor({ name: 'The Monster broke free!!', iconURL: 'https://collection-monsters.s3.amazonaws.com/breakout.png' })
		.setDescription(`**${name}** broke free and ran away, ${user.username}!`)
		.addFields(
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },

		)
		.setThumbnail(img);
}

function successCatch(user, res) {
	console.log(`[SuccessCatchEmbed] Monster was caught and added to ${user.username}'s inventory!`);
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x32CD32)
		.setAuthor({ name: 'You caught the Monster!', iconURL: 'https://collection-monsters.s3.amazonaws.com/success.png' })
		.setDescription(`**${name}** was added to your box, ${user.username}!`)
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
		.setColor(fetchMonsterDetails(rarity).color)
		.setAuthor({ name: 'A Monster appeared!', iconURL: 'https://collection-monsters.s3.amazonaws.com/tallgrass.png' })
		.setDescription(`**${user.username}** found a wild **${name}!**`)
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		.setFooter({ text: 'Click any of the options below to try and catch it!' })
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
	badCatch,
	successCatch,
	errorEmbed,
	textEmbed,
};
