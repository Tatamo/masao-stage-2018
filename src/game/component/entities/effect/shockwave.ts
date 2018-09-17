import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import BezierEasing from "bezier-easing";

export abstract class ShockWaveEffect extends Entity {
	public readonly sprite: PIXI.Sprite;
	protected constructor(
		level: Level,
		sprite: PIXI.Sprite,
		x: number,
		y: number,
		public readonly rad: number = 0,
		public readonly width: number = 32,
		public readonly height: number = 32,
		public readonly width_end: number = 64,
		public readonly height_end: number = 64,
		public readonly timespan: number = 10
	) {
		super(level, x, y);
		this.sprite = sprite;
		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;
		this.sprite.scale.x = width / 64;
		this.sprite.scale.y = height / 64;
		this.sprite.rotation = rad;
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends ShockWaveEffect> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			// easeOutExpo curve
			const easing = BezierEasing(0.19, 1, 0.22, 1);
			for (let i = 0; i <= this.parent.timespan; i++) {
				this.parent.sprite.scale.x =
					this.parent.width / 64 +
					((this.parent.width_end - this.parent.width) / 64) * easing(i / this.parent.timespan);
				this.parent.sprite.scale.y =
					this.parent.height / 64 +
					((this.parent.height_end - this.parent.height) / 64) * easing(i / this.parent.timespan);
				this.parent.sprite.alpha = 1 - easing(i / this.parent.timespan);
				yield;
			}
		}
		render(): void {}
	}
}
