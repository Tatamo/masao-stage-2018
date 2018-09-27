import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { easeOutExpo } from "../../../../../utils/easing";

export class Explode extends Entity {
	public readonly sprite: PIXI.Sprite;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["bullet_blue_large"]);
		this.sprite.scale.set(0);
		this.sprite.anchor.set(0.5);
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}

namespace States {
	export class Default<P extends Explode> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const timespan = 20;
			for (let i = 0; i < timespan; i++) {
				this.parent.sprite.scale.set(8 * easeOutExpo(i / timespan));
				this.checkCollision();
				yield;
			}
			for (let i = 0; i <= timespan; i++) {
				this.parent.sprite.alpha = 1 - easeOutExpo(i / timespan);
				yield;
			}
		}
		checkCollision(): void {
			const { jss } = this.parent.api;
			const r = 24 * this.parent.sprite.scale.x;
			const m_x = jss.getMyXReal() + 16;
			const m_y = jss.getMyYReal() + 16;
			const dx = this.parent.x - m_x;
			const dy = this.parent.y - m_y;
			// 主人公にダメージ
			if (dx * dx + dy * dy < r * r) {
				this.damage(jss, 35, 1);
			}
		}
	}
}
