const TextDecoder	= require('text-encoding').TextDecoder;
const nbind			= require('nbind');
const textDecoder	= new TextDecoder("utf-8");
const lib			= nbind.init(__dirname).lib;

Object.prototype.getKey = function(value) {
	let object = this;
	return Object.keys(object).find(key => object[key] === value);
};

const collectWChar = (mL, attribute) => {
	let arr = new Uint8Array(256);
	mL['get' + attribute](arr);
	return textDecoder.decode(arr);
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
	}
	/**
	 * Initiates the Mumble Link.
	 * @returns {boolean} Whether it has worked or not.
	 */
	init() {
		return this.mL.init();
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
	 * Checks if the user has selected a character yet.
	 * Needed to call getIdentity without error.
	 * @return {boolean} Whether the user has selected a character.
	 */
	hasCharacterSelected() {
		return collectWChar(this.mL, "Identity") != "";
	}
	/**
	 * Get the current link name.
	 * @returns {string} Should be 'Guild Wars 2'.
	 */
	getName() {
		return collectWChar(this.mL, "Name");
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
		for (let i=data.length-1;i>0;i--) {
			if (data[i].charCodeAt() != 0) {
				end = i+1;
				break;
			}
		}
		return JSON.parse(data.substring(0, end));
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