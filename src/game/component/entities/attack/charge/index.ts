import { Entity } from "../../entity";
import { EntityContainer } from "../../container";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { Energy } from "./energy";
import { Bullet } from "./bullet";
import * as PIXI from "pixi.js";
import { AsymmetryShockWaveEffect } from "./asymmetryshockwave";
import { easeOutExpo } from "../../../../../utils/easing";

export class ChargeAttack extends Entity {
	public readonly entities: EntityContainer;
	public readonly sprite_body: PIXI.Sprite;
	// public charge_finished: boolean;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		// this.charge_finished = false;
		this.entities = new EntityContainer(this.container);
		this.sprite_body = new PIXI.Sprite(level.api.resource.images["bullet_blue"]);
		this.sprite_body.anchor.x = 0.5;
		this.sprite_body.anchor.y = 0.5;
		this.sprite_body.alpha = 0;
		this.sprite_body.scale.x = this.sprite_body.scale.y = 0;
		this.container.addChild(this.sprite_body);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends ChargeAttack> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			const charge = this.charge();
			const easing = easeOutExpo;
			// 透明度が1になるまで更新
			while (this.parent.sprite_body.alpha < 1) {
				charge.next();
				this.parent.entities.update();
				this.parent.sprite_body.alpha += 0.04;
				this.parent.sprite_body.scale.x = this.parent.sprite_body.scale.y = this.parent.sprite_body.alpha * 1.6;
				yield;
			}
			this.parent.entities.destroy();
			this.parent.sprite_body.alpha = 1;
			this.parent.sprite_body.scale.x = this.parent.sprite_body.scale.y = 1.6;
			// 3連射
			for (let i = 1.6; i > 1; i -= 0.3) {
				this.attack();
				this.parent.sprite_body.scale.x = this.parent.sprite_body.scale.y = i;
				for (let ii = 0; ii < 8; ii++) {
					this.parent.sprite_body.scale.x = this.parent.sprite_body.scale.y = i - 0.3 * easing(ii / 8);
					yield;
				}
				yield* this.sleep(2);
			}
			this.attack();
			// アニメーションさせながら消滅させる
			this.parent.sprite_body.blendMode = PIXI.BLEND_MODES.ADD;
			for (let ii = 0; ii < 8; ii++) {
				this.parent.sprite_body.alpha = 1 - ii / 8;
				this.parent.sprite_body.scale.x = this.parent.sprite_body.scale.y = 1 - easing(ii / 8);
				yield;
			}
		}
		attack() {
			this.parent.level.add(new Bullet(this.parent.level, this.parent.x, this.parent.y));
			this.parent.level.add(
				new AsymmetryShockWaveEffect(
					this.parent.level,
					this.parent.x - 8,
					this.parent.y,
					Math.PI,
					16,
					32,
					48,
					96
				)
			);
		}
		*charge(): IterableIterator<void> {
			for (let i = 0; i < 6; i++) {
				for (let ii = 0; ii < 30; ii++) {
					const to_distance = 8 * Math.random();
					const to_rad = Math.random() * 2 * Math.PI;
					this.parent.entities.add(
						new Energy(
							this.parent.level,
							to_distance * Math.cos(to_rad),
							to_distance * Math.sin(to_rad),
							Math.random() * 2 * Math.PI,
							32 + 32 * Math.random(),
							20 + 20 * Math.random()
						)
					);
				}
				yield;
			}
		}
		render(): void {
			if (this.parent.entities.alive) this.parent.entities.render();
		}
	}
}
