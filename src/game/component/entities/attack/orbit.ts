import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";

export class Orbit extends Entity {
	public filter: PIXI.filters.ColorMatrixFilter;
	public sprite: PIXI.Sprite;
	constructor(level: Level, x: number, y: number, public degree_offset: number = 0, public scale: number = 1) {
		super(level, x, y);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["ring"]);
		this.sprite.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter(0.9)];
		this.sprite.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.sprite.anchor.set(0.5);
		this.sprite.scale.set(0);
		this.container.addChild(this.sprite);

		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends Orbit> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			// フレームごとにmove()の動きを行うとともに当たり判定を処理する
			const move = this.move();
			while (true) {
				const { done } = move.next();
				this.checkCollision();
				if (done) break;
				yield;
			}
		}
		*move(): IterableIterator<void> {
			for (let i = 0; i < 360; i += 6) {
				this.parent.x -= 5;
				const rad = ((i + this.parent.degree_offset) / 180) * Math.PI;
				const scale = Math.abs(Math.sin(rad));
				this.parent.sprite.scale.set(scale * this.parent.scale, 2 * scale * this.parent.scale);
				if (i !== 360 - 6) {
					yield;
				}
			}
		}
		checkCollision(): void {
			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal();
			const m_y = jss.getMyYReal();
			const width = 64 * this.parent.sprite.scale.x * 0.2;
			const height = 64 * this.parent.sprite.scale.y * 0.8;
			const x = this.parent.x;
			const y = this.parent.y;
			// 主人公との当たり判定
			if (
				m_x + 8 <= x + width / 2 &&
				m_x + 24 >= x - width / 2 &&
				m_y + 8 < y + height / 2 &&
				m_y + 24 >= y - height / 2
			) {
				// 主人公にダメージ
				this.damage(jss, 1, 1);
			}
		}
	}
}
