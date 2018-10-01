import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { easeOutCubic } from "../../../../../utils/easing";

export class Energy extends Entity {
	public readonly sprite: PIXI.Sprite;
	constructor(
		level: Level,
		public readonly to_x: number,
		public readonly to_y: number,
		rad: number,
		distance: number = 32,
		public readonly timespan: number = 20
	) {
		super(level, 0, 0);
		this.x = to_x - distance * Math.cos(rad);
		this.y = to_y - distance * Math.sin(rad);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["bullet_blue"]);
		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
		const s = 0.25 * Math.random();
		this.sprite.scale.x = 0.25 + s;
		this.sprite.scale.y = 0.25 + s;

		this.sprite.alpha = 0.1;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}

namespace States {
	export class Default<P extends Energy> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const dx = this.parent.to_x - this.parent.x;
			const dy = this.parent.to_y - this.parent.y;
			const easing = easeOutCubic;
			for (let i = 0; i < this.parent.timespan; i++) {
				this.parent.x = this.parent.to_x - dx * (1 - easing(i / this.parent.timespan));
				this.parent.y = this.parent.to_y - dy * (1 - easing(i / this.parent.timespan));
				this.parent.sprite.alpha = 0.05 + 0.1 * easing(i / this.parent.timespan);
				yield;
			}
		}
	}
}
