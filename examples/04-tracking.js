const MumbleLink = require('../');
const mumbleLink = new MumbleLink();
const util = require('util');

if (!mumbleLink.init()) {
	console.log('Could not create shared memory location!');
	process.exit(1);
}

if (!mumbleLink.isGuildWars2() || !mumbleLink.hasCharacterSelected()) {
	console.log('Guild Wars 2 not detected or user has not entered the world at least once!');
	process.exit(1);
}

let i = 40;
setInterval(() => {
	if (i == 0) {
		mumbleLink.close();
		process.exit();
	}
	let fVars = mumbleLink.getFvars();
	console.log(util.inspect(fVars));
	console.log(i);
	i--;
}, 500);