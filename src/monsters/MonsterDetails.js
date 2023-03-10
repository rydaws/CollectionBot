// module.exports.RarityColors = {
// 	Bronze: '0xAF6600',
// 	Silver: '0xCDCDCD',
// 	Gold: '0xFFD500',
// 	Diamond: '0x00E3FF',
// };

const bronzeMonster = { catchRate: 70, encounterRate: 50, color: 0xAF6600 };
const silverMonster = { catchRate: 50, encounterRate: 30, color: 0xCDCDCD };
const goldMonster = { catchRate: 25, encounterRate: 10, color: 0xFFD500 };
const diamondMonster = { catchRate: 10, encounterRate: 1, color: 0x00E3FF };

const monsters = [
	{ rarity: 'Bronze', catchRate: 70, encounterRate: 50, color: 0xAF6600 },
	{ rarity: 'Silver', catchRate: 50, encounterRate: 30, color: 0xCDCDCD },
	{ rarity: 'Gold', catchRate: 25, encounterRate: 10, color: 0xFFD500 },
	{ rarity: 'Diamond', catchRate: 10, encounterRate: 3, color: 0x00E3FF },
];

function fetchMonsterDetails(rarity) {
	rarity = rarity.toString().toLocaleUpperCase();

	switch (rarity) {
	case 'BRONZE':
		return monsters[0];
	case 'SILVER':
		return monsters[1];
	case 'GOLD':
		return monsters[2];
	case 'DIAMOND':
		return monsters[3];
	}
}

module.exports = {
	fetchMonsterDetails,
	bronzeMonster,
	silverMonster,
	goldMonster,
	diamondMonster,
	monsters,
};