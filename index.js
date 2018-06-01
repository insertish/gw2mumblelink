const TextDecoder	= require('text-encoding').TextDecoder;
const nbind			= require('nbind');
const textDecoder	= new TextDecoder("utf-8");
const lib			= nbind.init(__dirname).lib;
const spawn			= require('cross-spawn');

Object.prototype.getKey = function(value) {
	let object = this;
	return Object.keys(object).find(key => object[key] === value);
};

const collectWChar = (mL, attribute, size = 256) => {
	let arr = new Uint8Array(size);
	mL['get' + attribute](arr);
	return textDecoder.decode(arr);
};

const collectUChar = (mL, attribute, size = 48) => {
	let arr = new Uint8Array(size);
	mL['get' + attribute](arr);
	return arr;
};

const collectFloats = (mL, attribute, size = 3) => {
	let arr = new Uint8Array(size);
	mL['get' + attribute](arr);
	return arr;
};

/**
 * @typedef {Object} identity
 * @property {string} name Character Name
 * @property {int} profession Character's Profession
 * @property {int} race Character's Race
 * @property {int} map_id ID of the character's current map (See API:2/maps)
 * @property {int} world_id ID of the character's current world (See API:2/worlds)
 * @property {int} team_color_id ID of the character's team color (See API:2/colors)
 * @property {boolean} commander Whether the character has a commander tag
 * @property {int} fov Vertical Field of View
 * @property {int} uisz User's current UI scaling
 */

/**
 * Mumble Link Class
 * @class
 */
class MumbleLink {
	constructor() {
		this.mL = new lib.MumbleLink();
		this.active = false;
	}
	/**
	 * Initiates the Mumble Link.
	 * @returns {boolean} Whether it has worked or not.
	 */
	init() {
		let result = this.mL.init();
		if (result) this.active = true;
		return result;
	}
	/**
	 * Checks if the client is connected to GW2.
	 * @returns {boolean} Whether it is connected or not.
	 */
	isGuildWars2() {
		// I know it looks ugly, but this was the best solution.
		// Neither .includes, /Guild Wars 2/, /Guild\wWars\w2/ or /Guild*Wars*2/ wanted to work. :/
		return /Guild/.test(this.getName()) && /Wars/.test(this.getName()) && /2/.test(this.getName());
	}
	/**
	 * Check if GW2 is actually running or not.
	 * Useful for situations where isGuildWars2() dosen't mention any closure.
	 * @returns {Promise} Resolves if running, rejects if not.
	 */
	isGuildWars2Running() {
		return new Promise((resolve, reject) => {
			let command = 'ps';
			if (/^win/.test(process.platform)) command = `powershell -command "& {&'${command}'}"`;
			let child = spawn(command);
			let collect = '';
			child.stdout.on('data', data => collect += `${data}\n`);
			child.on('close', () => {
				if (collect.includes('Gw2-64')) resolve();
				else reject();
			});
		});
	}
	/**
	 * Checks if the user has selected a character yet.
	 * Needed to call getIdentity without error.
	 * @return {boolean} Whether the user has selected a character.
	 */
	hasCharacterSelected() {
		return collectWChar(this.mL, "Identity") != "";
	}
	/**
	 * Get UI variables
	 */
	getUIvar() {
		return {
			version: this.mL.uiVersion(),
			tick: this.mL.uiTick()
		};
	}
	/**
	 * Get the current link name.
	 * @returns {string} Should be 'Guild Wars 2'.
	 */
	getName() {
		return collectWChar(this.mL, "Name");
	}
	/**
	 * Get the link description
	 * @returns {string} A description
	 */
	getDescription() {
		return collectWChar(this.mL, "Description", 2048);
	}
	/**
	 * Get the character's identity.
	 * @returns {Identity} Identity object
	 */
	getIdentity() {
		let data = collectWChar(this.mL, "Identity");
		/**
		 * Remove all whitespaces because JSON.parse dosen't like them.
		 */
		let end = 0;
		for (let i=0;i<data.length;i++) {
			if (data[i].charCodeAt() == 0) {
				end = i;
				break;
			}
		}
		data = data.substring(0, end);
		return JSON.parse(data);
	}
	/**
	 * Get character / user / camera positions
	 */
	getContext() {
		let raw = collectUChar(this.mL, "Context", this.mL.getContextLength());
		let data = {
			serverAddress: raw.slice(0, 28)
		};
		["mapId", "mapType", "shardId", "instance", "buildId"].forEach((v, i) => {
			let temp = raw.slice(29 + (i * 4), 29 + (i * 4) + 4);
			let num = 0;
			temp.forEach((x, i) => {
				num += x << temp.length - i;
			});
			data[v] = num;
		});
		return data;
	}
	/**
	 * Get f* variables
	 */
	getFvars() {
		return {
			character: {
				position: collectFloats(this.mL, "AvatarPosition"),
				front: collectFloats(this.mL, "AvatarFront"),
				top: collectFloats(this.mL, "AvatarTop")
			},
			camera: {
				position: collectFloats(this.mL, "CameraPosition"),
				front: collectFloats(this.mL, "CameraFront"),
				top: collectFloats(this.mL, "CameraTop")
			}
		};
	}
	/**
	 * Probably important.
	 */
	close() {
		if (this.active) this.mL.close();
		this.active = false;
	}
}

module.exports = MumbleLink;

module.exports.ProfessionEnum = {
	GUARDIAN: 1,
	WARRIOR: 2,
	ENGINEER: 3,
	RANGER: 4,
	THEIF: 5,
	ELEMENTALIST: 6,
	MESMER: 7,
	NECROMANCER: 8,
	REVENANT: 9
};

module.exports.RaceEnum = {
	ASURA: 0,
	CHARR: 1,
	HUMAN: 2,
	NORN: 3,
	SYLVARI: 4
};

module.exports.UISizeEnum = {
	SMALL: 0,
	NORMAL: 1,
	LARGE: 2,
	LARGER: 3
};