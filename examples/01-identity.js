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

let identity = mumbleLink.getIdentity();

console.log(`Hi, ${identity.name}!
I see you are a ${MumbleLink.RaceEnum.getKey(identity.race)} ${MumbleLink.ProfessionEnum.getKey(identity.profession)}.
You are on map ${identity.map_id}, world ${identity.world_id}.
You ${identity.commander ? 'do' : 'do not'} currently have a commander tag.
Your fov is ${identity.fov} and your ui is ${MumbleLink.UISizeEnum.getKey(identity.uisz)}.`);

mumbleLink.close();