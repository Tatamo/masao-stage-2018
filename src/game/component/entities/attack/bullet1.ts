import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../../../../main";
import { GlowFilter } from "@pixi/filter-glow";

export class Bullet1 extends Entity {
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	public theta: number;
	constructor(level: Level, x: number, y: number, theta?: number | null) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		this.theta = theta === null || theta === undefined ? Math.random() * 2 * Math.PI : theta;
		const { resource } = this.api;
		const sprite_body = new PIXI.Sprite(resource.images["bullet_blue"]);
		sprite_body.anchor.x = 0.5;
		sprite_body.anchor.y = 0.5;
		sprite_body.filters = [
			(this.filter = new PIXI.filters.ColorMatrixFilter()),
			// new GlowFilter(2, 2, 0, 0xffffff),
			new PIXI.filters.AlphaFilter()
		];
		sprite_body.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(sprite_body);
		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends Bullet1> extends AbstractState<P> {
		private skip!: number;
		init(): void {
			// 位相差を設定
			this.skip = this.parent.theta;
			this.parent.filter.hue(this.skip);
		}
		*update(): IterableIterator<void> {
			for (let i = 0; i < 360; i += 2) {
				if (this.skip > 0) {
					// 一番最初に一定の位相だけずらす
					this.skip -= 2;
					continue;
				}
				this.parent.x += this.parent.vx;
				this.parent.y += this.parent.vy;

				const { jss } = this.parent.api;
				const x = this.parent.x;
				const y = this.parent.y;
				const mx: number = jss.getMyXReal();
				const my: number = jss.getMyYReal();

				const dx = x - (mx + 16);
				const dy = y - (my + 16);

				// 円形の当たり判定
				if (dx * dx + dy * dy < 20 * 20) {
					//  主人公にダメージ
					this.damage(jss, 15, 1);
				}

				// 画面外に出た場合は消滅する
				const view_x: number = jss.getViewXReal();
				const view_y: number = jss.getViewYReal();
				if (x + 32 < view_x || x > view_x + VIEW_WIDTH || y + 32 < view_y || y > view_y + VIEW_HEIGHT) {
					this.parent.kill();
				}

				this.parent.filter.hue(i);
				yield;
			}
		}
		render(): void {}
	}
}
