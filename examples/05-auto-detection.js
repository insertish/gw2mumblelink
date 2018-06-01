const MumbleLink = require('../');
const mumbleLink = new MumbleLink();

// Ensure we clean up at the end !!!
process.stdin.resume();
process.on('exit', () => {
	mumbleLink.close();
});

if (!mumbleLink.init()) {
	console.log('Could not create shared memory location!');
	process.exit(1);
}

// --> At this point GW2 should be closed.

// Here we just report what we know every 3 seconds.
setInterval(() => {
	mumbleLink.isGuildWars2Running().then(() => {
		if (mumbleLink.isGuildWars2()) {
			console.log('[S] The user is in-game and has selected a character.');
		} else {
			console.log('[O] The user has the game open, but is not in-game.');
		}
	}).catch(() => {
		console.log('[F] The user is not in-game and does not have the game open.');
		// Ideally, if it reaches this condition after you did something in the other, now is the time to revert it.
	});
}, 3000);