import * as PIXI from "pixi.js";
export class Resource {
	/**
	 * パターン画像のテクスチャ
	 * パターンコードで添え字アクセスして取得する
	 */
	get pattern(): Array<PIXI.Texture> {
		return this._pattern;
	}

	/**
	 * ファイルから読み込んだ画像のテクスチャ
	 */
	get images(): { [name: string]: PIXI.Texture } {
		return this._images;
	}

	/**
	 * 使いまわすために新しく生成したテクスチャを格納する
	 */
	get textures(): Map<string, PIXI.Texture> {
		return this._textures;
	}

	/**
	 * ファイルから読み込んだ音楽
	 */
	get sounds(): { [p: string]: HTMLAudioElement } {
		return this._sounds;
	}
	private readonly _pattern: Array<PIXI.Texture>;
	private readonly _images: { [name: string]: PIXI.Texture };
	private readonly _textures: Map<string, PIXI.Texture>;
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

		this._textures = new Map();

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
