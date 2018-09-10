import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";

export class Attack1 extends Entity {
	public vx: number;
	public vy: number;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		const { resource } = this.api;
		const createTexture = (): PIXI.Texture => {
			const c = document.createElement("canvas");
			c.width = c.height = 32;
			const ctx = c.getContext("2d")!;
			const grad = ctx.createRadialGradient(16, 16, 6, 16, 16, 16);
			grad.addColorStop(0, "#ffffffff");
			grad.addColorStop(0.4, "#ff0000ff");
			grad.addColorStop(1, "#ff000000");
			ctx.fillStyle = grad;
			ctx.arc(16, 16, 16, 0, 2 * Math.PI);
			ctx.fill();
			return PIXI.Texture.fromCanvas(c);
		};
		const sprite_body = new PIXI.Sprite(resource.registerIfNecessary("attack1_body", createTexture));
		sprite_body.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(sprite_body);
		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends Attack1> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			this.parent.x += this.parent.vx;
			this.parent.y += this.parent.vy;
		}
		render(): void {}
	}
}
