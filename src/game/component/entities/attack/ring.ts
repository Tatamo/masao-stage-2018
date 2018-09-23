import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { easeInOutCubic } from "../../../../utils/easing";

export class Ring extends Entity {
	get degree(): number {
		return this._degree;
	}
	set degree(value: number) {
		value = value % 360;
		if (value < 0) value += 360;
		this._degree = value;
		this.sprite.rotation = (this._degree / 180) * Math.PI;
	}
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	public sprite: PIXI.Sprite;
	private _degree!: number;
	constructor(level: Level, x: number, y: number, degree: number, public rotate_direction: number = 1) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["ring"]);
		this.sprite.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter(0.9)];
		this.sprite.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.sprite.anchor.set(0.5);
		this.sprite.scale.set(0);
		this.degree = degree;
		this.container.addChild(this.sprite);

		this.setState(new States.Showing(this));
	}
	hide() {
		this.setState(new States.Hide(this), false);
	}
}

namespace States {
	export class Default<P extends Ring> extends AbstractState<P> {
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
			// yield* this.sleep(20);
			// this.parent.setState(new End(this.parent), false);
			for (let i = 0; i < 360; i++) {
				this.parent.degree = this.parent.degree + this.parent.rotate_direction;
				if (i !== 360 - 1) {
					yield;
				}
			}
		}
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
				this.damage(jss, 10, 1);
			}
		}
	}
	export class Showing<P extends Ring> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const easing = easeInOutCubic;
			const timespan = 20;
			// 出現
			for (let i = 0; i < timespan; i++) {
				this.parent.sprite.scale.set(easing(i / timespan) * 3, easing(i / timespan));
				yield;
			}
			this.parent.sprite.scale.set(3, 1);
			// 高速回転
			const degree_org = this.parent.degree;
			for (let i = 0; i < timespan * 2; i++) {
				this.parent.degree = degree_org + 720 * easing(i / (timespan * 2)) * this.parent.rotate_direction;
				// 0.5をピークで収縮させる
				let scale = easing(i / (timespan * 2)) - 0.5;
				// 0.5以下なら反転
				if (scale < 0) scale *= -1;
				// 2倍して[0,0.5]を[0,1]に変換
				scale *= 2;
				// 20%は常に残す
				scale = 0.2 + 0.8 * scale;
				this.parent.sprite.scale.set(scale * 3, scale);
				if (i === timespan) this.parent.ee.emit("shrink");
				yield;
			}
			this.parent.sprite.scale.set(3, 1);
			this.parent.degree = degree_org;
			this.parent.setState(new Default(this.parent));
		}
	}
	export class Hide<P extends Ring> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const easing = easeInOutCubic;
			const timespan = 20;
			// 消失
			for (let i = 0; i < timespan; i++) {
				this.parent.degree += this.parent.rotate_direction;
				this.parent.sprite.scale.set((1 - easing(i / timespan)) * 3, 1 - easing(i / timespan));
				this.parent.sprite.alpha = 1 - easing(i / timespan);
				yield;
			}
			this.parent.sprite.scale.set(0, 0);
			this.parent.kill();
		}
	}
}
