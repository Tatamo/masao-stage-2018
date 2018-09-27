import { Entity } from "../../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../../levels/level";
import { AbstractState } from "../../../../../statemachine";
import { quadraticBezierCurve } from "../../../../../../utils/bezier";

export class Trace extends Entity {
	public readonly sprite: PIXI.Sprite;

	/**
	 * @param level
	 * @param x
	 * @param y
	 * @param tx ターゲットX座標
	 * @param ty ターゲットY座標
	 * @param mx 中間地点ガイド用Y座標
	 * @param my 中間地点ガイド用Y座標
	 * @param dt time offset
	 */
	constructor(
		level: Level,
		x: number,
		y: number,
		public readonly tx: number,
		public readonly ty: number,
		public readonly mx: number,
		public readonly my: number,
		public readonly dt: number = 0
	) {
		super(level, x, y);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["bullet_blue"]);
		this.sprite.scale.set(0.5 + 0.25 * Math.random());
		this.sprite.anchor.set(0.5);
		this.sprite.alpha = 0.1;
		this.sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}

namespace States {
	export class Default<P extends Trace> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			const bezier = quadraticBezierCurve(
				this.parent,
				{ x: this.parent.mx, y: this.parent.my },
				{ x: this.parent.tx, y: this.parent.ty }
			);
			const timespan = 35;
			for (let i = 0; i < timespan; i++) {
				const t = (i + this.parent.dt) / timespan + (0.3 * (Math.random() - 0.5)) / timespan;
				this.parent.x = bezier(t).x;
				this.parent.y = bezier(t).y;
				yield;
			}
			this.parent.x = this.parent.tx;
			this.parent.y = this.parent.ty;
			yield* this.sleep(10);
		}
	}
}
