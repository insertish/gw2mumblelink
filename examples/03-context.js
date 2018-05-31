const MumbleLink = require('../');
const mumbleLink = new MumbleLink();

if (!mumbleLink.init()) {
	console.log('Could not create shared memory location!');
	process.exit(1);
}

if (!mumbleLink.isGuildWars2() || !mumbleLink.hasCharacterSelected()) {
	console.log('Guild Wars 2 not detected or user has not entered the world at least once!');
	process.exit(1);
}

let context = mumbleLink.getContext();

console.log(context);

mumbleLink.close();