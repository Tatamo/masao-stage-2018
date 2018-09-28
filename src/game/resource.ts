import * as PIXI from "pixi.js";
export default class Resource {
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

		this._images = {};
		this._sounds = {};
		for (const [label, resource] of Object.entries(resources)) {
			const image = /^(.*)_image$/.exec(label);
			if (image !== null) {
				this._images[image[1]] = resource.texture;
				continue;
			}
			const sound = /^(.*)_sound$/.exec(label);
			if (sound !== null) {
				this._sounds[sound[1]] = resource.data;
			}
		}
		this._textures = new Map();
	}

	/**
	 * 指定した名前のテクスチャが存在しなければ作成して登録し、存在すればそれをそのまま返します
	 * @param name テクスチャ名
	 * @param texture_callback テクスチャを返す関数 指定した名前のテクスチャが存在しない場合のみ呼び出される
	 */
	registerIfNecessary(name: string, texture_callback: () => PIXI.Texture): PIXI.Texture {
		if (!this.textures.has(name)) {
			this.textures.set(name, texture_callback());
		}
		return this.textures.get(name)!;
	}
	static createResizeTexture(
		texture: PIXI.Texture,
		width: number,
		height: number,
		offset_x: number = 0,
		offset_y: number = 0
	): PIXI.Texture {
		const _t = texture.clone();
		const rect = _t.frame.clone();
		rect.x += offset_x;
		rect.y += offset_y;
		rect.width = width;
		rect.height = height;
		_t.frame = rect;
		return _t;
	}
}
