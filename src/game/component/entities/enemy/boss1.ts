import * as PIXI from "pixi.js";
import { AbstractState } from "../../../statemachine";
import { Resource } from "../../../resource";
import { Enemy } from "./enemy";
import { Level } from "../../../levels/level";
import { Bullet1 } from "../attack/bullet1";
import { ChargeAttack } from "../attack/charge";
import { Shield } from "../effect/shield";
import { ShieldAttack } from "../attack/shield";

/**
 * ボス1
 */
export class Boss1 extends Enemy {
	public readonly sprite_normal: PIXI.Sprite;
	public readonly sprite_damage: PIXI.Sprite;
	public readonly shield: Shield;
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
		this.shield = new Shield(level, 32, 32);
		this.container.addChild(this.shield.container, this.sprite_normal, this.sprite_damage);
		this.setState(new Boss1States.Default(this));
	}
}

namespace Boss1States {
	export class Default<P extends Boss1> extends AbstractState<P> {
		init(): void {
			this.parent.sprite_normal.visible = true;
			this.parent.sprite_damage.visible = false;
		}
		*update(): IterableIterator<void> {
			// フレームごとにmove()の動きを行うとともに当たり判定を処理する
			for (const _ of this.move()) {
				this.checkCollision();
				this.parent.shield.update();
				yield;
			}
		}
		*move(): IterableIterator<void> {
			yield* this.sleep(24);
			// this.parent.setState(new ChargeAttackState(this.parent));
			this.parent.setState(new ShieldAttackState(this.parent));
		}
		attack() {
			this.parent.level.add(new Bullet1(this.parent.level, this.parent.x + 16, this.parent.y + 32));
		}
		checkCollision(): void {
			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal();
			const m_y = jss.getMyYReal();
			// 主人公との当たり判定
			if (
				m_x <= this.parent.x + 64 &&
				m_x + 32 >= this.parent.x &&
				m_y < this.parent.y + 64 &&
				m_y + 32 >= this.parent.y
			) {
				if (!this.parent.shield.on && jss.getMyVY() > 10) {
					// ボスにシールドがなく、主人公が降下中

					// 主人公が踏む
					jss.setMyPress(3);
					jss.setMyYReal(this.parent.y + 8);

					// １０点加算
					jss.addScore(10);

					// ボスのHPを減らす
					this.parent.damage(20);
					this.parent.setState(new Damage(this.parent));
				} else {
					// 主人公にダメージ
					jss.setMyHPDamage(1);

					// 主人公が死亡
					if (jss.getMyHP() <= 0) {
						jss.setMyMiss(2);
					}
				}
			}
		}
	}
	export class ChargeAttackState<P extends Boss1> extends Default<P> {
		*move(): IterableIterator<void> {
			this.parent.level.add(new ChargeAttack(this.parent.level, this.parent.x - 8, this.parent.y + 32));
			yield* this.sleep(80);
			this.parent.setState(new Default(this.parent));
		}
	}
	export class ShieldAttackState<P extends Boss1> extends Default<P> {
		*move(): IterableIterator<void> {
			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal() + 16;
			const m_y = jss.getMyYReal() + 16;
			const direction = Math.atan2(m_y - (this.parent.y + 32), m_x - (this.parent.x + 32));
			for (let speed = 8; speed < 32; speed += 4) {
				this.parent.level.add(
					new ShieldAttack(this.parent.level, this.parent.x + 32, this.parent.y + 32, direction, speed)
				);
			}
			this.parent.shield.hide();
			yield* this.sleep(80);
			this.parent.setState(new Default(this.parent));
		}
	}
	export class Damage<P extends Boss1> extends AbstractState<P> {
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
	export class Die<P extends Boss1> extends AbstractState<P> {
		init(): void {
			this.parent.sprite_normal.visible = false;
			this.parent.sprite_damage.visible = false;
			this.parent.kill();
		}
		*update(): IterableIterator<void> {}
	}
}
