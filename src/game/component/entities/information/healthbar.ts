import { AbstractState } from "../../../statemachine";
import { EasingFunction } from "bezier-easing";
import * as PIXI from "pixi.js";
import { Entity } from "../entity";
import { Level } from "../../../levels/level";
import { Resource } from "../../../resource";
import { easeOutExpo } from "../../../../utils/easing";

/**
 * 主人公のHPを表示するバー
 */
export class HealthBar extends Entity {
	public health_rate: number;
	public current_hp: number;
	public readonly frame: PIXI.Sprite;
	public readonly colormatrix: PIXI.filters.ColorMatrixFilter;
	public readonly bar: PIXI.Sprite;
	public readonly face: PIXI.Sprite;
	public readonly text: PIXI.Text;
	private readonly textures: {
		normal: PIXI.Texture;
		damage: PIXI.Texture;
		miss: PIXI.Texture;
	};
	constructor(level: Level, public max_hp: number) {
		super(level, level.api.jss.getMyYReal(), level.api.jss.getMyYReal());
		const { jss, resource } = this.api;
		// HPを最大値として初期化
		this.current_hp = max_hp;
		this.health_rate = 1;
		// HPバーの枠を作成
		this.frame = new PIXI.Sprite(resource.images["health_bar"]);
		this.frame.position.x = this.frame.position.y = 24;
		this.container.addChild(this.frame);
		this.x = jss.getViewXReal();
		this.y = jss.getViewYReal();

		// 伸び縮みするHBバーを作成
		this.bar = PIXI.Sprite.from(
			(() => {
				// 幅1高さ12でグラデーション付きの緑色の画像を生成する
				const c = document.createElement("canvas");
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

		// 色合いを変更するためのフィルタ
		this.colormatrix = new PIXI.filters.ColorMatrixFilter();
		this.bar.filters = [this.colormatrix];

		const map = resource.textures;
		const getLabel = (name: string) => `health_bar_face_${name}`;

		// work-around for tslint-loader
		// tslint:disable-next-line:no-unnecessary-type-assertion
		for (const [name, code] of [["normal", 100], ["damage", 107], ["miss", 110]] as Array<[string, number]>) {
			// まだテクスチャが作成されていない場合は作成して登録
			resource.registerIfNecessary(getLabel(name), () =>
				Resource.createResizeTexture(resource.pattern[code], 32, 16)
			);
		}
		// 既存テクスチャを使いまわす
		this.textures = {
			normal: map.get(getLabel("normal"))!,
			damage: map.get(getLabel("damage"))!,
			miss: map.get(getLabel("miss"))!
		};
		// 主人公の顔を表示するスプライトを作成
		this.face = new PIXI.Sprite();
		this.face.x = 3;
		this.face.y = 20;
		this.face.anchor.x = 1;
		this.face.scale.x = -1;
		this.setFaceTexture("normal");
		this.frame.addChild(this.face);

		const style = new PIXI.TextStyle({
			dropShadow: true,
			dropShadowAlpha: 0.2,
			dropShadowDistance: 2,
			fill: ["#cc8336", "#45454f"],
			fontFamily: "monospace",
			fontSize: 14,
			fontWeight: "bold",
			miterLimit: 3,
			padding: 3,
			stroke: "white",
			strokeThickness: 2
		});
		this.text = new PIXI.Text(`HP: ${Math.round(this.health_rate * 100)} / 100`, style);
		this.text.x = 41;
		this.text.y = 23;
		this.frame.addChild(this.text);

		// 主人公の行動を監視して表示する画像を切り替える
		const ee: PIXI.utils.EventEmitter = jss.createPlayerEventEmitter();
		ee.on("damage", () => {
			this.setFaceTexture("damage");
		});
		ee.on("muteki_end", () => {
			this.setFaceTexture("normal");
		});
		ee.on("miss", () => {
			this.setFaceTexture("miss");
			// もう使わないのでEventEmitterの登録を解除する
			jss.removePlayerEventEmitter(ee);
		});

		this.setState(new HealthBarStates.Default(this));
	}
	public setFaceTexture(mode: "normal" | "damage" | "miss") {
		this.face.texture = this.textures[mode];
	}
}

namespace HealthBarStates {
	abstract class Base<P extends HealthBar> extends AbstractState<P> {
		init(): void {}
		render(): void {
			this.parent.x = this.parent.api.jss.getViewXReal();
			this.parent.y = this.parent.api.jss.getViewYReal();
			this.parent.bar.scale.x = 128 * this.parent.health_rate;
			this.parent.text.text = `HP: ${Math.round(this.parent.health_rate * 100)
				.toString()
				.padStart(3)} / 100`;
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
			this.easing = easeOutExpo;
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
