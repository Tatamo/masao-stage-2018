import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { GlowFilter } from "@pixi/filter-glow";

export class Bomb extends Entity {
	public vx: number;
	public vy: number;
	public sprite: PIXI.Sprite;
	public get pattern(): Array<PIXI.Texture> {
		return this.level.api.resource.pattern;
	}

	/**
	 * @param level
	 * @param x
	 * @param y
	 * @param direction default=1 1:右向き -1:左向き
	 */
	constructor(level: Level, x: number, y: number, direction: 1 | -1 = 1) {
		super(level, x, y);
		this.vx = 40 * direction;
		this.vy = 0;
		this.sprite = new PIXI.Sprite(this.pattern[171]);
		this.sprite.anchor.set(0.5);
		this.sprite.filters = [new GlowFilter(4, 4, 0, 0xcccccc)];
		this.container.addChild(this.sprite);
		this.setState(new States.Fall(this));
	}
}

namespace States {
	export class Base<P extends Bomb> extends AbstractState<P> {
		checkCollision(): void {
			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal();
			const m_y = jss.getMyYReal();
			const dx = m_x + 16 - this.parent.x;
			const dy = m_y + 16 - this.parent.y;
			// 円形の当たり判定
			if (dx * dx + dy * dy < 24 * 24) {
				this.damage(jss, 8, 1);
			}
		}
	}
	export class Fall<P extends Bomb> extends Base<P> {
		*update(): IterableIterator<void> {
			if (this.parent.vx > 0) this.parent.vx -= 2;
			else if (this.parent.vx < 0) this.parent.vx += 2;
			this.parent.x += Math.trunc(this.parent.vx / 10);
			this.parent.vy += 8;
			if (this.parent.vy > 200) this.parent.vy = 200;
			this.parent.y += Math.trunc(this.parent.vy / 10);
			// ブロックとの当たり判定
			if (
				this.parent.api.jss.getMapchip(
					Math.round((this.parent.x - 64) / 32),
					Math.round((this.parent.y - 320) / 32)
				) >= 20
			) {
				this.parent.y += (-this.parent.y % 32) + 32;
				this.parent.setState(new Explode(this.parent), false);
			}
			this.checkCollision();
		}
		render(): void {
			const pattern = this.parent.pattern;
			if (this.parent.vx > 28) {
				this.parent.sprite.texture = pattern[171];
				this.parent.sprite.scale.x = -1;
			} else if (this.parent.vx < -28) {
				this.parent.sprite.texture = pattern[171];
				this.parent.sprite.scale.x = 1;
			} else {
				this.parent.sprite.texture = pattern[170];
				this.parent.sprite.scale.x = 1;
			}
		}
	}
	export class Explode<P extends Bomb> extends Base<P> {
		*update(): IterableIterator<void> {
			const pattern = this.parent.pattern;
			this.parent.sprite.scale.x = 1;
			this.parent.sprite.filters![0].enabled = false;
			for (let i = 1; i <= 9; i++) {
				if (i <= 3) this.parent.sprite.texture = pattern[172];
				else if (i <= 6) this.parent.sprite.texture = pattern[173];
				else this.parent.sprite.texture = pattern[174];
				this.checkCollision();
				yield;
			}
		}
	}
}
