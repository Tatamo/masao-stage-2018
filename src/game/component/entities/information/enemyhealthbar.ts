import { AbstractState } from "../../../statemachine";
import { EasingFunction } from "bezier-easing";
import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { easeOutExpo } from "../../../../utils/easing";
import { Enemy } from "../enemy/enemy";

/**
 * 主人公のHPを表示するバー
 */
export class EnemyHealthBar extends Entity {
	public health_rate: number;
	public current_hp: number;
	public readonly colormatrix: PIXI.filters.ColorMatrixFilter;
	public readonly bar: PIXI.Sprite;
	public readonly text: PIXI.Text;
	constructor(level: Level, public parent: Enemy, public max_hp: number) {
		super(level, level.api.jss.getMyYReal(), level.api.jss.getMyYReal());
		// HPを最大値として初期化
		this.current_hp = max_hp;
		this.health_rate = 1;

		// 伸び縮みするHBバーを作成
		this.bar = PIXI.Sprite.from(
			(() => {
				// 幅1高さ8でグラデーション付きの緑色の画像を生成する
				const c = document.createElement("canvas");
				c.width = 1;
				c.height = 12;
				const ctx = c.getContext("2d")!;
				const grad = ctx.createLinearGradient(0, 0, 0, 8);
				grad.addColorStop(0, "#00dd00");
				grad.addColorStop(0.65, "#00aa00");
				grad.addColorStop(0.9, "#00dd00");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, 1, 8);
				return c;
			})()
		);
		this.bar.scale.x = 128;
		this.bar.y = 64;
		this.container.addChild(this.bar);

		// 色合いを変更するためのフィルタ
		this.colormatrix = new PIXI.filters.ColorMatrixFilter();
		this.bar.filters = [this.colormatrix];

		const style = new PIXI.TextStyle({
			dropShadow: true,
			dropShadowAlpha: 0.2,
			dropShadowDistance: 2,
			fill: ["#aaaaaa", "#333333"],
			fontFamily: "monospace",
			fontSize: 10,
			fontWeight: "bold",
			miterLimit: 3,
			padding: 3,
			stroke: "white",
			strokeThickness: 2
		});
		this.text = new PIXI.Text(`${Math.round(this.health_rate * 100)} / 100`, style);
		this.text.y = 64 + 10;
		this.text.x = 64 - this.text.width;
		this.container.addChild(this.text);

		this.setState(new HealthBarStates.Default(this));
	}
}

namespace HealthBarStates {
	abstract class Base<P extends EnemyHealthBar> extends AbstractState<P> {
		init(): void {}
		render(): void {
			this.parent.x = this.parent.parent.x;
			this.parent.y = this.parent.parent.y;
			this.parent.bar.scale.x = 64 * this.parent.health_rate;
			this.parent.text.text = `${Math.round(this.parent.health_rate * 100)
				.toString()
				.padStart(3)} / 100`;
		}
	}
	export class Default<P extends EnemyHealthBar> extends Base<P> {
		*update(): IterableIterator<void> {
			if (this.parent.parent.hp < this.parent.current_hp) {
				// HPが前フレームより減っていた場合はアニメーション状態に切り替える
				const from = this.parent.current_hp;
				this.parent.current_hp = this.parent.parent.hp;
				this.parent.setState(
					new DamageAnimation(
						this.parent,
						from,
						this.parent.current_hp,
						((from - this.parent.current_hp) / this.parent.max_hp) * 10 + 10
					)
				);
			} else if (this.parent.parent.hp !== this.parent.current_hp) {
				this.parent.current_hp = this.parent.parent.hp;
			}
			this.parent.colormatrix.hue(-120 * (1 - this.parent.health_rate));
		}
	}

	/**
	 * ダメージを受けた際にHPバーの値を減らすアニメーション
	 */
	export class DamageAnimation<P extends EnemyHealthBar> extends Base<P> {
		private readonly easing: EasingFunction;

		constructor(parent: P, private hp_from: number, private hp_to: number, private max_frame: number = 10) {
			super(parent);
			this.easing = easeOutExpo;
		}
		*update(): IterableIterator<void> {
			const diff = this.hp_from - this.hp_to;
			for (let i = 0; i < this.max_frame; i++) {
				this.parent.health_rate = (this.hp_from - diff * this.easing(i / this.max_frame)) / this.parent.max_hp;
				this.parent.colormatrix.hue(-120 * (1 - this.parent.health_rate));
				yield;
			}
			this.parent.health_rate = this.hp_to / this.parent.max_hp;
			this.parent.colormatrix.hue(-120 * (1 - this.parent.health_rate));
			this.parent.setState(new Default(this.parent));
		}
	}
}
