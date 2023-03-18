const mousetrap = { id: 1, name: 'mousetrap', emoji: '<:mousetrap:1082044930677031032>', catchRate: 10, price: 100, enabled: true };
const net = { id: 2, name: 'net', catchRate: 25, emoji: '2️⃣', price: 250, enabled: true };
const lasso = { id: 3, name: 'lasso', catchRate: 35, emoji: '3️⃣', price: 500, enabled: true };
const beartrap = { id: 4, name: 'beartrap', catchRate: 50, emoji: '4️⃣', price: 2500, enabled: true };
const safe = { id: 5, name: 'safe', catchRate: 100, emoji: '5️⃣', price: 10000, enabled: true };

// TODO add capability to change catchRate and price
function setActive(trap, activity) {
	trap = trap.toString().toUpperCase();

	switch (trap) {
	case 'MOUSETRAP':
		mousetrap.enabled = activity;
		break;
	case 'NET':
		net.enabled = activity;
		break;
	case 'LASSO':
		lasso.enabled = activity;
		break;
	case 'BEARTRAP':
		beartrap.enabled = activity;
		break;
	case 'SAFE':
		safe.enabled = activity;
		break;
	}
}

function getTrap(item_name) {
	item_name = item_name.toString().toUpperCase();

	switch (item_name) {
	case 'MOUSETRAP':
		return mousetrap;
	case 'NET':
		return net;
	case 'LASSO':
		return lasso;
	case 'BEARTRAP':
		return beartrap;
	case 'SAFE':
		return safe;
	}
}

module.exports = {
	setActive,
	getTrap,
	mousetrap,
	net,
	lasso,
	beartrap,
	safe,
};