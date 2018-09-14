import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";

export class Orb extends Entity {
	public vx: number;
	public vy: number;
	public filter: PIXI.filters.ColorMatrixFilter;
	public readonly sprite: PIXI.Sprite;
	constructor(level: Level, x: number, y: number, public readonly rad: number, public readonly speed: number) {
		super(level, x, y);
		this.vx = this.speed * Math.cos(rad);
		this.vy = this.speed * Math.sin(rad);
		const { resource } = this.api;
		// Bullet1で使ったものと同じ描き方で色が青
		const createTexture = (): PIXI.Texture => {
			const c = document.createElement("canvas");
			c.width = c.height = 32;
			const ctx = c.getContext("2d")!;
			const grad = ctx.createRadialGradient(16, 16, 6, 16, 16, 16);
			grad.addColorStop(0, "#ffffffff");
			grad.addColorStop(0.4, "#0000ffff");
			grad.addColorStop(1, "#0000ff00");
			ctx.fillStyle = grad;
			ctx.arc(16, 16, 16, 0, 2 * Math.PI);
			ctx.fill();
			return PIXI.Texture.fromCanvas(c);
		};
		this.sprite = new PIXI.Sprite(resource.registerIfNecessary("charge_effect_orb", createTexture));
		this.sprite.filters = [(this.filter = new PIXI.filters.ColorMatrixFilter()), new PIXI.filters.AlphaFilter()];
		// this.sprite.filters[1].blendMode = PIXI.BLEND_MODES.ADD;
		const s = 0.25 * Math.random();
		this.sprite.scale.x = 0.25 + s;
		this.sprite.scale.y = 0.25 + s;
		this.sprite.alpha = 0.15;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}

namespace States {
	export class Default<P extends Orb> extends AbstractState<P> {
		private skip!: number;
		init(): void {
			// 最初の位相差を設定
			this.skip = 0;
			this.parent.filter.hue(this.skip);
		}
		*update(): IterableIterator<void> {
			for (let i = 0; i < 360; i += 2) {
				if (this.skip > 0) {
					// 一番最初に一定の位相だけずらす
					this.skip -= 2;
					continue;
				}
				this.parent.vx *= 0.95;
				this.parent.vy *= 0.95;
				this.parent.x += this.parent.vx;
				this.parent.y += this.parent.vy;
				this.parent.sprite.alpha *= 0.95;

				this.parent.filter.hue(i);
				if (
					this.parent.sprite.alpha < 0.01 ||
					this.parent.vx * this.parent.vx + this.parent.vy * this.parent.vy < 0.1
				) {
					this.parent.kill();
					return;
				}
				yield;
			}
		}
		render(): void {}
	}
}
