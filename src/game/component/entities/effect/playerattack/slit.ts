import { AbstractState } from "../../../../statemachine";
import BezierEasing from "bezier-easing";
import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";

export class SlitEffect extends Entity {
	public readonly sprite: PIXI.Sprite;
	constructor(level: Level, x: number, y: number, public readonly rad: number, public readonly speed: number) {
		super(level, x, y);
		this.sprite = new PIXI.Sprite(level.api.resource.images["slit"]);
		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;
		this.sprite.rotation = rad;
		const scale = Math.random();
		this.sprite.scale.x = 0.1 + scale * 0.4;
		this.sprite.scale.y = 0.1 + scale * 0.4;
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(this.sprite);
		this.setState(new SEStates.Default(this), false);
	}
}
namespace SEStates {
	export class Default<P extends SlitEffect> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			const timespan = 10;
			// easeOutCubic curve
			const easing = BezierEasing(0.215, 0.61, 0.355, 1);
			for (let i = 0; i <= timespan; i++) {
				const speed = this.parent.speed * (1 - easing(i / timespan));
				this.parent.x += Math.cos(this.parent.rad) * speed;
				this.parent.y += Math.sin(this.parent.rad) * speed;
				this.parent.sprite.alpha = 1 - easing(i / timespan);
				yield;
			}
		}
		render(): void {}
	}
}
