import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../../../../../main";

export class Bullet extends Entity {
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.vx = -8;
		this.vy = 0;
		const { resource } = this.api;
		const sprite_body = new PIXI.Sprite(resource.images["bullet_blue"]);
		sprite_body.anchor.x = 0.5;
		sprite_body.anchor.y = 0.5;
		sprite_body.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter()];
		sprite_body.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(sprite_body);
		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends Bullet> extends AbstractState<P> {
		private phase!: number;
		init(): void {
			this.phase = 0;
			this.parent.filter.hue(this.phase);
		}
		*update(): IterableIterator<void> {
			this.phase = (this.phase + 12) % 360;
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
				this.damage(jss, 3, 1);
			}

			// 画面外に出た場合は消滅する
			const view_x: number = jss.getViewXReal();
			const view_y: number = jss.getViewYReal();
			if (x + 32 < view_x || x > view_x + VIEW_WIDTH || y + 32 < view_y || y > view_y + VIEW_HEIGHT) {
				this.parent.kill();
			}

			this.parent.filter.hue(20 * (Math.cos((this.phase * Math.PI) / 180) - 1));
		}
		render(): void {}
	}
}
