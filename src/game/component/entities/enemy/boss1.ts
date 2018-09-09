import * as PIXI from "pixi.js";
import { AbstractState } from "../../../statemachine";
import { GameAPI } from "../../../api";
import { Entity } from "../entity";
import { Resource } from "../../../resource";

/**
 * 主人公のHPを表示するバー
 */
export class Boss1 extends Entity {
	constructor(api: GameAPI, x: number, y: number) {
		super(api);
		this.container.x = x;
		this.container.y = y;
		const { resource } = api;
		const map = resource.textures;
		if (!map.has("boss1")) {
			map.set("boss1", Resource.createResizeTexture(resource.pattern[188], 64, 64));
		}
		this.container.addChild(new PIXI.Sprite(map.get("boss1")));
		this.setState(new Boss1States.Default(this));
	}
}

namespace Boss1States {
	abstract class Base<P extends Boss1> extends AbstractState<P> {
		init(): void {}
		render(): void {}
	}
	export class Default<P extends Boss1> extends Base<P> {
		*update(): IterableIterator<void> {}
	}
}
