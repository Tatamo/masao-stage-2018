import * as PIXI from "pixi.js";
import { AbstractState } from "../../../statemachine";
import { Resource } from "../../../resource";
import { Enemy } from "./enemy";
import { Level } from "../../../levels/level";
import { Bullet1 } from "../attack/bullet1";

/**
 * ボス1
 */
export class Boss1 extends Enemy {
	public readonly sprite_normal: PIXI.Sprite;
	public readonly sprite_damage: PIXI.Sprite;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y, 100);
		const { resource } = this.api;
		this.sprite_normal = new PIXI.Sprite(
			resource.registerIfNecessary("boss1_normal", () =>
				Resource.createResizeTexture(resource.pattern[188], 64, 64)
			)
		);
		this.sprite_damage = new PIXI.Sprite(
			resource.registerIfNecessary("boss1_damage", () =>
				Resource.createResizeTexture(resource.pattern[178], 64, 32)
			)
		);
		this.sprite_damage.y = 32;
		this.sprite_damage.visible = false;
		this.container.addChild(this.sprite_normal, this.sprite_damage);
		this.setState(new Boss1States.Default(this));
	}
}

namespace Boss1States {
	abstract class Base<P extends Boss1> extends AbstractState<P> {
		init(): void {}
		render(): void {}
	}
	export class Default<P extends Boss1> extends Base<P> {
		init(): void {
			this.parent.sprite_normal.visible = true;
			this.parent.sprite_damage.visible = false;
		}
		*update(): IterableIterator<void> {
			// フレームごとにmove()の動きを行うとともに当たり判定を処理する
			for (const _ of this.move()) {
				this.checkCollision();
				yield;
			}
		}
		*move(): IterableIterator<void> {
			for (let i = 0; i < 3; i++) {
				this.attack();
				yield* this.sleep(14);
			}
			yield* this.sleep(14);
		}
		attack() {
			this.parent.level.add(new Bullet1(this.parent.level, this.parent.x, this.parent.y + 16));
		}
		checkCollision(): void {
			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal();
			const m_y = jss.getMyYReal();
			// 主人公との当たり判定
			if (
				m_x <= this.parent.x + 64 &&
				m_x + 32 >= this.parent.x &&
				m_y <= this.parent.y + 64 &&
				m_y + 32 >= this.parent.y
			) {
				if (jss.getMyVY() > 10) {
					//  降下中

					//  主人公が踏む
					jss.setMyPress(3);
					jss.setMyYReal(this.parent.y + 8);

					//  １０点加算
					jss.addScore(10);

					//  ボスのHPを減らす
					this.parent.damage(20);
					this.parent.setState(new Damage(this.parent));
				} else {
					//  主人公にダメージ
					jss.setMyHPDamage(1);

					//  主人公が死亡
					if (jss.getMyHP() <= 0) {
						jss.setMyMiss(2);
					}
				}
			}
		}
	}
	export class Damage<P extends Boss1> extends Base<P> {
		init(): void {
			this.parent.sprite_normal.visible = false;
			this.parent.sprite_damage.visible = true;
		}
		*update(): IterableIterator<void> {
			for (let i = 0; i < 24; i++) {
				yield;
			}
			if (this.parent.hp > 0) {
				this.parent.setState(new Default(this.parent));
			} else {
				this.parent.setState(new Die(this.parent));
			}
		}
	}
	export class Die<P extends Boss1> extends Base<P> {
		init(): void {
			this.parent.sprite_normal.visible = false;
			this.parent.sprite_damage.visible = false;
			this.parent.kill();
		}
		*update(): IterableIterator<void> {}
	}
}
