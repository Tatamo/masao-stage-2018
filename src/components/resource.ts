import * as PIXI from "pixi.js";
export class Resource {
	get pattern(): Array<PIXI.Texture> {
		return this._pattern;
	}
	get images(): { [name: string]: PIXI.Texture } {
		return this._images;
	}
	get sounds(): { [p: string]: HTMLAudioElement } {
		return this._sounds;
	}
	private readonly _pattern: Array<PIXI.Texture>;
	private readonly _images: { [name: string]: PIXI.Texture };
	private readonly _sounds: { [name: string]: HTMLAudioElement };
	constructor(resources: PIXI.loaders.ResourceDictionary) {
		this._pattern = [];
		this._pattern.length = 250;
		for (let i = 0; i < 250; i++) {
			this._pattern[i] = resources["pattern"].textures![`pattern_${i}`];
		}
		this._images = {
			pattern: resources["pattern_image"].texture,
			title: resources["title"].texture,
			gameover: resources["gameover"].texture,
			ending: resources["ending"].texture,
			health_bar: resources["health_bar"].texture
		};

		const sounds = [
			"bakuhatu",
			"clear",
			"coin",
			"dosun",
			"fumu",
			"gameover",
			"get",
			"happa",
			"item",
			"jump",
			"kiki",
			"mgan",
			"mizu",
			"shot",
			"sjump",
			"stage1",
			"title",
			"tobasu"
		];

		this._sounds = {};
		for (const name of sounds) {
			this._sounds[name] = resources[`sound_${name}`].data;
		}
	}
}
