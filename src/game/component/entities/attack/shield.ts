import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../../../../main";
import { GlowFilter } from "@pixi/filter-glow";

export class ShieldAttack extends Entity {
	public vx: number;
	public vy: number;
	public readonly sprite: PIXI.Sprite;
	public readonly alpha_filter: PIXI.filters.AlphaFilter;
	constructor(level: Level, x: number, y: number, direction: number, speed: number) {
		super(level, x, y);
		this.vx = speed * Math.cos(direction);
		this.vy = speed * Math.sin(direction);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["shield"]);
		this.sprite.filters = [(this.alpha_filter = new PIXI.filters.AlphaFilter())];
		this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
		this.sprite.scale.x = this.sprite.scale.y = 1.2;
		this.alpha_filter.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends ShieldAttack> extends AbstractState<P> {
		*update(): IterableIterator<void> {
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
			if (dx * dx + dy * dy < (32 + 16) * (32 + 16)) {
				//  主人公にダメージ
				this.damage(jss, 25, 1);
			}

			// 画面外に出た場合は消滅する
			const view_x: number = jss.getViewXReal();
			const view_y: number = jss.getViewYReal();
			if (x + 96 < view_x || x > 96 + view_x + VIEW_WIDTH || y + 96 < view_y || y > 96 + view_y + VIEW_HEIGHT) {
				this.parent.kill();
			}
		}
		render(): void {}
	}
}
