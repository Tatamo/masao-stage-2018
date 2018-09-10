import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";

export class Laser1 extends Entity {
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	public sprite: PIXI.Sprite;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		const { resource } = this.api;
		const createTexture = (): PIXI.Texture => {
			const c = document.createElement("canvas");
			c.width = c.height = 32;
			const ctx = c.getContext("2d")!;
			const grad = ctx.createLinearGradient(0, 0, 0, 32);
			grad.addColorStop(0, "#ff000000");
			grad.addColorStop(0.2, "#ff0000ff");
			grad.addColorStop(0.4, "#ffffffff");
			grad.addColorStop(0.6, "#ffffffff");
			grad.addColorStop(0.8, "#ff0000ff");
			grad.addColorStop(1, "#ff000000");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, 32, 32);
			return PIXI.Texture.fromCanvas(c);
		};
		this.sprite = new PIXI.Sprite(resource.registerIfNecessary("laser1_body", createTexture));
		this.sprite.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter()];
		this.sprite.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.sprite.anchor.x = 1;
		this.sprite.anchor.y = 0.5;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends Laser1> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			this.parent.sprite.width += 32;
		}
		render(): void {}
	}
}
