import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { easeInSine } from "../../../../../utils/easing";

export class Orb extends Entity {
	public readonly sprite: PIXI.Sprite;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["bullet_blue"]);
		this.sprite.scale.set(0.5 + 0.25 * Math.random());
		this.sprite.alpha = 0.15;
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}

namespace States {
	export class Default<P extends Orb> extends AbstractState<P> {
		private r!: number;
		private cx!: number;
		private cy!: number;
		init() {
			this.r = 24 + 32 * Math.random();
			this.cx = this.parent.x;
			this.cy = this.parent.y;
		}
		*update(): IterableIterator<void> {
			let cnt = 0;
			let degree = 360 * Math.random();
			let vd = 8 + 16 * Math.random();
			let r = this.r;
			while (cnt <= 18) {
				const rad = (degree * Math.PI) / 180;
				this.parent.x = this.cx + r * Math.cos(rad);
				this.parent.y = this.cy + r * Math.sin(rad);
				degree = (degree + vd) % 360;
				r = this.r * (1 - easeInSine(cnt / 18));
				this.parent.sprite.alpha = 0.15 * easeInSine(cnt / 18);
				cnt++;
				yield;
			}
		}
	}
}
