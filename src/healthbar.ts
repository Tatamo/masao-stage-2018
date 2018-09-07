import { AbstractState, StateMachine } from "./statemachine";
import BezierEasing, { EasingFunction } from "bezier-easing";
import * as PIXI from "pixi.js";

/**
 * 主人公のHPを表示するバー
 */
export class HealthBar extends StateMachine {
	public health_rate: number;
	public current_hp: number;
	public readonly graphics: PIXI.Graphics;
	public readonly frame: PIXI.Sprite;
	constructor(
		stage: PIXI.Container,
		private readonly resources: PIXI.loaders.ResourceDictionary,
		public readonly jss: any,
		public max_hp: number
	) {
		super();
		this.current_hp = max_hp;
		this.health_rate = 1;
		this.frame = new PIXI.Sprite(resources["health_bar"].texture);
		this.frame.position.x = 16;
		this.frame.position.y = 32 + 5;
		this.frame.scale.x = this.frame.scale.y = 1.5;
		stage.addChild(this.frame);
		this.graphics = new PIXI.Graphics();
		this.frame.addChild(this.graphics);
		this.setState(new HealthBarStates.Default(this));
	}
}

namespace HealthBarStates {
	abstract class Base<P extends HealthBar> extends AbstractState<P> {
		init(): void {}
		draw(): void {
			this.parent.graphics
				.clear()
				.beginFill(0x0000ff)
				.drawRect(39, 3, 100 * this.parent.health_rate, 8)
				.endFill();
		}
	}
	export class Default<P extends HealthBar> extends Base<P> {
		*update(): IterableIterator<void> {
			if (this.parent.jss.getMyHP() < this.parent.current_hp) {
				// HPが前フレームより減っていた場合はアニメーション状態に切り替える
				const from = this.parent.current_hp;
				this.parent.current_hp = this.parent.jss.getMyHP();
				this.parent.setState(new DamageAnimation(this.parent, from, this.parent.current_hp));
			} else if (this.parent.jss.getMyHP() !== this.parent.current_hp) {
				this.parent.current_hp = this.parent.jss.getMyHP();
			}
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
				yield;
			}
			this.parent.health_rate = this.hp_to / this.parent.max_hp;
			this.parent.setState(new Default(this.parent));
		}
	}
}
