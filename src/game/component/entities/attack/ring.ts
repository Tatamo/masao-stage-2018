import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";

export class Ring extends Entity {
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	public sprite: PIXI.Sprite;
	public degree: number;
	constructor(level: Level, x: number, y: number, rotate: number, public rotate_direction: number = 1) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		this.degree = (rotate * 180) / Math.PI;
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["ring"]);
		this.sprite.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter(0.9)];
		this.sprite.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.sprite.anchor.set(0.5);
		this.sprite.scale.set(3, 1);
		this.container.addChild(this.sprite);

		this.setState(new States.Default(this));
	}
}

namespace States {
	abstract class Base<P extends Ring> extends AbstractState<P> {
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
		abstract move(): IterableIterator<void>;
		checkCollision(): void {
			const { jss } = this.parent.api;
			// リングの両端に円形の当たり判定をつくる
			const m_x = jss.getMyXReal() + 16;
			const m_y = jss.getMyYReal() + 16;
			const r = 64;
			const rad = (this.parent.degree * Math.PI) / 180;
			const x1 = this.parent.x + r * Math.cos(rad);
			const y1 = this.parent.y + r * Math.sin(rad);
			const x2 = this.parent.x + r * Math.cos(rad + Math.PI);
			const y2 = this.parent.y + r * Math.sin(rad + Math.PI);

			const dx1 = m_x - x1;
			const dy1 = m_y - y1;
			const dx2 = m_x - x2;
			const dy2 = m_y - y2;
			if (dx1 * dx1 + dy1 * dy1 < 20 * 20 || dx2 * dx2 + dy2 * dy2 < 20 * 20) {
				this.damage(jss, 1, 1);
			}
		}
	}
	export class Default<P extends Ring> extends Base<P> {
		*move(): IterableIterator<void> {
			// yield* this.sleep(20);
			// this.parent.setState(new End(this.parent), false);
			for (let i = 0; i < 360; i++) {
				this.parent.degree = (this.parent.degree + this.parent.rotate_direction) % 360;
				this.parent.sprite.rotation = (this.parent.degree / 180) * Math.PI;
				yield;
			}
		}
	}
}
