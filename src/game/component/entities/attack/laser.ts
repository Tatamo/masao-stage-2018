import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { easeOutExpo } from "../../../../utils/easing";

export class Laser extends Entity {
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	public body: PIXI.mesh.Rope;
	public points: Array<PIXI.Point>;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		const { resource } = this.api;
		this.points = [[0, 0], [12, 0], [20, 0], [32, 0]].map(([x, y]) => new PIXI.Point(x, y));
		this.body = new PIXI.mesh.Rope(resource.images["long_bullet"], this.points);

		this.body.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter()];
		this.body.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.body.scale.set(2, 3);
		this.container.addChild(this.body);
		this.setState(new States.Expand(this));
	}
	end() {
		this.setState(new States.End(this), false);
	}
}

namespace States {
	abstract class Base<P extends Laser> extends AbstractState<P> {
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
			const scale = this.parent.body.scale;
			const x = this.parent.x + this.parent.points[1].x * scale.x;
			const y = this.parent.y - 16;
			const width = (this.parent.points[2].x - this.parent.points[1].x) * scale.x;
			const height = (32 / 3) * scale.y;
			const m_x = jss.getMyXReal();
			const m_y = jss.getMyYReal();
			// 主人公との当たり判定
			if (m_x <= x + width && m_x + 32 >= x && m_y < y + height && m_y + 32 >= y) {
				// 主人公にダメージ
				this.damage(jss, 1, 1);
			}
		}
	}
	export class Default<P extends Laser> extends Base<P> {
		*move(): IterableIterator<void> {
			// yield* this.sleep(20);
			// this.parent.setState(new End(this.parent), false);
		}
	}
	export class Expand<P extends Laser> extends Base<P> {
		private timespan!: number;
		init(): void {
			this.timespan = 20;
		}
		*move(): IterableIterator<void> {
			for (let i = 0; i < this.timespan; i++) {
				this.parent.points[0].x -= 32;
				this.parent.points[1].x -= 32;
				yield;
			}
			this.parent.setState(new Default(this.parent));
		}
	}
	export class End<P extends Laser> extends AbstractState<P> {
		private timespan!: number;
		init(): void {
			this.timespan = 14;
		}
		*update(): IterableIterator<void> {
			const easing = easeOutExpo;
			const scaley = this.parent.body.scale.y;
			for (let i = 0; i < this.timespan; i++) {
				// this.parent.points[2].x -= 32;
				// this.parent.points[3].x -= 32;
				this.parent.body.scale.y = scaley * (1 - easing(i / this.timespan));
				// this.parent.body.alpha = 0.75 + 0.25 * (1 - easing(i / this.timespan));
				yield;
			}
		}
	}
}
