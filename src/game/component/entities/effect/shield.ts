import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { GlowFilter } from "@pixi/filter-glow";
import { easeInOutCubic } from "../../../../utils/easing";

export class Shield extends Entity {
	get on(): boolean {
		return this._on;
	}
	public _on: boolean;
	public readonly sprite: PIXI.Sprite;
	public readonly alpha_filter: PIXI.filters.AlphaFilter;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this._on = true;
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["shield"]);
		this.sprite.filters = [(this.alpha_filter = new PIXI.filters.AlphaFilter(0))];
		this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
		this.sprite.scale.x = this.sprite.scale.y = 1.2;
		this.container.addChild(this.sprite);
		// this.setState(new States.Default(this));
		this.show();
	}
	show(): void {
		this.setState(new States.Showing(this));
	}
	hide(): void {
		this.setState(new States.Hide(this));
	}
}

namespace States {
	export class Default<P extends Shield> extends AbstractState<P> {}
	export class Hide<P extends Shield> extends AbstractState<P> {
		init() {
			this.parent._on = false;
			this.parent.container.visible = false;
		}
	}
	export class Showing<P extends Shield> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			this.parent._on = true;
			this.parent.container.visible = true;
			// マスクを設定
			const createTexture = () => {
				const c = document.createElement("canvas");
				c.width = 100;
				c.height = 180;
				const ctx = c.getContext("2d")!;
				const grad = ctx.createLinearGradient(0, 0, 0, 180);
				grad.addColorStop(0.6, "#ffffffff");
				grad.addColorStop(0.8, "#ffffff00");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, 100, 180);
				return PIXI.Texture.fromCanvas(c);
			};
			const mask = new PIXI.Sprite(
				this.parent.level.api.resource.registerIfNecessary("shield_mask", createTexture)
			);
			mask.anchor.set(0.5, 1);
			this.parent.container.addChild(mask);
			this.parent.container.mask = mask;
			mask.y = 10;

			// 輪っかのスプライトを用意
			const shockwave = new PIXI.Sprite(this.parent.level.api.resource.images["shockwave_asymmetry"]);
			shockwave.anchor.set(0.5, 0.5);
			shockwave.scale.set(0.8, 1.6);
			shockwave.y = -64 - 8;
			shockwave.rotation = -Math.PI / 2;
			this.parent.container.addChild(shockwave);

			this.parent.alpha_filter.alpha = 0.8;

			const easing = easeInOutCubic;
			const timespan = 20;
			for (let i = 0; i < timespan; i++) {
				if (i < 6) shockwave.alpha = 0;
				else shockwave.alpha = 1;
				mask.y = 10 + 6 * timespan * easing(i / timespan);
				shockwave.y = -64 - 8 + 6 * timespan * easing(i / timespan);
				shockwave.scale.x = 0.8 * Math.sin(easing(i / timespan) * Math.PI);
				shockwave.scale.y = 1.6 * Math.sin(easing(i / timespan) * Math.PI);
				this.parent.alpha_filter.alpha = 0.8 + 0.2 * Math.sin(easing(i / timespan) * Math.PI);
				yield;
			}
			this.parent.container.removeChild(shockwave);
			this.parent.container.removeChild(mask);
			this.parent.container.mask = null;
			this.parent.setState(new Default(this.parent));
		}
	}
}
