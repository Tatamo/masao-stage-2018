import { AbstractState, StateMachine } from "./statemachine";
import BezierEasing, { EasingFunction } from "bezier-easing";
import * as PIXI from "pixi.js";
import { GameAPI } from "./api";

/**
 * 主人公のHPを表示するバー
 */
export class HealthBar extends StateMachine {
	public health_rate: number;
	public current_hp: number;
	public readonly frame: PIXI.Sprite;
	public readonly colormatrix: PIXI.filters.ColorMatrixFilter;
	public readonly bar: PIXI.Sprite;
	constructor(public readonly api: GameAPI, stage: PIXI.Container, public max_hp: number) {
		super();
		// HPを最大値として初期化
		this.current_hp = max_hp;
		this.health_rate = 1;
		// HPバーの枠を作成
		this.frame = new PIXI.Sprite(this.api.resources["health_bar"].texture);
		this.frame.position.x = this.frame.position.y = 32;
		// 色合いを変更するためのフィルタ
		this.frame.filters = [new PIXI.filters.ColorMatrixFilter()];
		stage.addChild(this.frame);

		this.bar = PIXI.Sprite.from(
			(() => {
				const c = document.createElement("canvas")!;
				c.width = 1;
				c.height = 12;
				const ctx = c.getContext("2d")!;
				const grad = ctx.createLinearGradient(0, 0, 0, 12);
				grad.addColorStop(0, "#00dd00");
				grad.addColorStop(0.65, "#00aa00");
				grad.addColorStop(0.9, "#00dd00");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, 1, 12);
				return c;
			})()
		);
		this.bar.scale.x = 128;
		this.bar.position.x = this.bar.position.y = 3;
		this.frame.addChild(this.bar);

		this.colormatrix = new PIXI.filters.ColorMatrixFilter();
		this.bar.filters = [this.colormatrix];
		this.setState(new HealthBarStates.Default(this));
	}
}

namespace HealthBarStates {
	abstract class Base<P extends HealthBar> extends AbstractState<P> {
		init(): void {}
		render(): void {
			this.parent.bar.scale.x = 128 * this.parent.health_rate;
		}
	}
	export class Default<P extends HealthBar> extends Base<P> {
		*update(): IterableIterator<void> {
			if (this.parent.api.jss.getMyHP() < this.parent.current_hp) {
				// HPが前フレームより減っていた場合はアニメーション状態に切り替える
				const from = this.parent.current_hp;
				this.parent.current_hp = this.parent.api.jss.getMyHP();
				this.parent.setState(
					new DamageAnimation(
						this.parent,
						from,
						this.parent.current_hp,
						((from - this.parent.current_hp) / this.parent.max_hp) * 10 + 10
					)
				);
			} else if (this.parent.api.jss.getMyHP() !== this.parent.current_hp) {
				this.parent.current_hp = this.parent.api.jss.getMyHP();
			}
			this.parent.colormatrix.hue(-120 * (1 - this.parent.health_rate));
		}
	}

	/**
	 * ダメージを受けた際にHPバーの値を減らすアニメーション
	 */
	export class DamageAnimation<P extends HealthBar> extends Base<P> {
		private readonly easing: EasingFunction;

		constructor(parent: P, private hp_from: number, private hp_to: number, private max_frame: number = 10) {
			super(parent);
			// easeOutExpo curve
			this.easing = BezierEasing(0.19, 1, 0.22, 1);
		}
		*update(): IterableIterator<void> {
			const diff = this.hp_from - this.hp_to;
			for (let i = 0; i < this.max_frame; i++) {
				this.parent.health_rate = (this.hp_from - diff * this.easing(i / this.max_frame)) / this.parent.max_hp;
				this.parent.colormatrix.hue(-120); // 常に赤く
				yield;
			}
			this.parent.health_rate = this.hp_to / this.parent.max_hp;
			this.parent.setState(new Default(this.parent));
		}
	}
}
