import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../../../../main";

export class Attack1 extends Entity {
	public vx: number;
	public vy: number;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.vx = -4;
		this.vy = 0;
		const { resource } = this.api;
		const createTexture = (): PIXI.Texture => {
			const c = document.createElement("canvas");
			c.width = c.height = 32;
			const ctx = c.getContext("2d")!;
			const grad = ctx.createRadialGradient(16, 16, 6, 16, 16, 16);
			grad.addColorStop(0, "#ffffffff");
			grad.addColorStop(0.4, "#ff0000ff");
			grad.addColorStop(1, "#ff000000");
			ctx.fillStyle = grad;
			ctx.arc(16, 16, 16, 0, 2 * Math.PI);
			ctx.fill();
			return PIXI.Texture.fromCanvas(c);
		};
		const sprite_body = new PIXI.Sprite(resource.registerIfNecessary("attack1_body", createTexture));
		sprite_body.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(sprite_body);
		this.setState(new States.Default(this));
	}
}

namespace States {
	export class Default<P extends Attack1> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			this.parent.x += this.parent.vx;
			this.parent.y += this.parent.vy;

			const { jss } = this.parent.api;
			const x = this.parent.x;
			const y = this.parent.y;
			const mx: number = jss.getMyXReal();
			const my: number = jss.getMyYReal();

			const dx = x + 16 - (mx + 16);
			const dy = y + 16 - (my + 16);

			// 円形の当たり判定
			if (dx * dx + dy * dy < 20 * 20) {
				//  主人公にダメージ
				jss.setMyHPDamage(3);

				//  主人公が死亡
				if (jss.getMyHP() <= 0) {
					jss.setMyMiss(1);
				}
			}

			// 画面外に出た場合は消滅する
			const view_x: number = jss.getViewXReal();
			const view_y: number = jss.getViewYReal();
			if (x + 32 < view_x || x > view_x + VIEW_WIDTH || y + 32 < view_y || y > view_y + VIEW_HEIGHT) {
				this.parent.kill();
			}
		}
		render(): void {}
	}
}
