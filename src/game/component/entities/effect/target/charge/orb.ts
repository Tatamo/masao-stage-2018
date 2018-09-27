import { Entity } from "../../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../../levels/level";
import { AbstractState } from "../../../../../statemachine";
import { easeInSine } from "../../../../../../utils/easing";

export class Orb extends Entity {
	public readonly sprite: PIXI.Sprite;
	public degree: number;
	public cx: number;
	public cy: number;
	public r: number;
	public vd: number;
	constructor(level: Level, x: number, y: number, public readonly scale: number = 1) {
		super(level, x, y);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["bullet_blue"]);
		this.sprite.scale.set(0);
		this.sprite.anchor.set(0.5);
		this.sprite.alpha = 0.15;
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
		this.container.addChild(this.sprite);
		this.cx = this.x;
		this.cy = this.y;
		this.degree = 360 * Math.random();
		this.r = 24 + 32 * Math.random();
		this.vd = 8 + 16 * Math.random();
		this.setState(new States.Default(this), false);
	}
	shrink() {
		this.setState(new States.Shrink(this), false);
	}
}

namespace States {
	export class Default<P extends Orb> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const r_org = this.parent.r;
			this.parent.r = 0;
			const s = 0.5 + 0.25 * Math.random();
			for (let i = 0; i < 18; i++) {
				const e = easeInSine(i / 18);
				const rad = (this.parent.degree * Math.PI) / 180;
				this.parent.x = this.parent.cx + this.parent.r * Math.cos(rad);
				this.parent.y = this.parent.cy + this.parent.r * Math.sin(rad);
				this.parent.degree = (this.parent.degree + this.parent.vd) % 360;
				this.parent.r = r_org * e;
				this.parent.sprite.alpha = 0.15 * (1 - e);
				this.parent.sprite.scale.set((s + e) * this.parent.scale);
				yield;
			}
		}
	}
	export class Shrink<P extends Orb> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const r_org = this.parent.r;
			const scale_org = this.parent.sprite.scale.x;
			for (let i = 0; i < 18; i++) {
				const e = easeInSine(i / 18);
				const rad = (this.parent.degree * Math.PI) / 180;
				this.parent.x = this.parent.cx + this.parent.r * Math.cos(rad);
				this.parent.y = this.parent.cy + this.parent.r * Math.sin(rad);
				this.parent.degree = (this.parent.degree + this.parent.vd) % 360;
				this.parent.r = r_org * (1 - e);
				this.parent.sprite.scale.set(scale_org * (1 - e));
				yield;
			}
		}
	}
}
