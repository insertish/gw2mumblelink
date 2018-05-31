const MumbleLink = require('../');
const mumbleLink = new MumbleLink();

if (!mumbleLink.init()) {
	console.log('Could not create shared memory location!');
	process.exit(1);
}

if (!mumbleLink.isGuildWars2()) {
	console.log('Guild Wars 2 not detected or user has not entered the world at least once!');
	process.exit(1);
}

if (!mumbleLink.hasCharacterSelected()) {
	console.log('Player has not selected a character yet!');
	process.exit(1);
}

console.log('The player is currently in-game and has selected a character!');