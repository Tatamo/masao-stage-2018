import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { EntityContainer } from "../container";
import { AbstractState } from "../../../statemachine";
import BezierEasing from "bezier-easing";

/**
 * 主人公が敵を攻撃した際のエフェクト
 */
export class PlayerAttack extends Entity {
	public readonly entities: EntityContainer;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.entities = new EntityContainer(this.container);
		this.setState(new PAStates.Default(this), false);
	}
}

class SlitEffect extends Entity {
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
namespace PAStates {
	export class Default<P extends PlayerAttack> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			for (let i = 0; i < 2; i++) {
				for (let ii = 0; ii < 30 - i * 12; ii++) {
					this.parent.entities.add(
						new SlitEffect(
							this.parent.level,
							0,
							0,
							Math.random() * 2 * Math.PI,
							(2 - i) * 12 + (0.4 + 0.6 * Math.random()) * 28
						)
					);
				}
				this.parent.entities.update();
				yield;
			}
			// 子供が全員死ぬまでは死なない
			while (this.parent.entities.size > 0) {
				this.parent.entities.update();
				yield;
			}
		}
		render(): void {
			this.parent.entities.render();
		}
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
