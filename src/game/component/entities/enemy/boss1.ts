import * as PIXI from "pixi.js";
import { AbstractState } from "../../../statemachine";
import { Resource } from "../../../resource";
import { Enemy } from "./enemy";
import { Level } from "../../../levels/level";
import { Bullet1 } from "../attack/bullet1";
import { ChargeAttack } from "../attack/charge";
import { Shield } from "../effect/shield";
import { ShieldAttack } from "../attack/shield";
import { EntityContainer } from "../container";
import { SmoothShockWaveEffect } from "../effect/smoothshockwave";
import { Laser } from "../attack/laser";
import { Ring } from "../attack/ring";
import { Orbit } from "../attack/orbit";
import { EnemyHealthBar } from "../information/enemyhealthbar";

/**
 * ボス1
 */
export class Boss1 extends Enemy {
	public readonly sprite_normal: PIXI.Sprite;
	public readonly sprite_damage: PIXI.Sprite;
	public readonly shield: Shield;
	public readonly healthbar: EnemyHealthBar;
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
		this.healthbar = new EnemyHealthBar(level, this, this.hp);
		level.add(this.healthbar);
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
			if (!this.parent.shield.on) this.parent.shield.show();
			yield* this.sleep(24);
			// this.parent.setState(new ChargeAttackState(this.parent));
			this.parent.setState(new ShieldAttackState(this.parent));
			// this.parent.setState(new LaserAttackState(this.parent));
			yield* this.sleep(Infinity);
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
					this.damage(jss, 1, 2);
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
			const shield = new PIXI.Sprite(this.parent.api.resource.images["shield"]);
			shield.anchor.set(0.5);
			shield.scale.set(1.2);
			shield.position.set(32);
			shield.alpha = 0;
			this.parent.container.addChildAt(shield, 1);
			const entities = new EntityContainer(this.parent.container);
			let cnt = 0;
			for (let i = 0; i < 3; i++) {
				entities.add(
					new SmoothShockWaveEffect(
						this.parent.level,
						32,
						32,
						0,
						160 + i * 4,
						160 + i * 4,
						64,
						64,
						32 + i * 2
					)
				);
				for (let ii = 0; ii < [12, 8, 12][i]; ii++) {
					entities.update();
					shield.alpha = Math.sin((cnt * 2 * Math.PI) / 180);
					cnt++;
					yield;
				}
			}
			this.parent.container.removeChild(shield);
			this.parent.container.removeChild(entities.container);
			shield.destroy();
			entities.destroy();

			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal() + 16;
			const m_y = jss.getMyYReal() + 16;
			const direction = Math.atan2(m_y - (this.parent.y + 32), m_x - (this.parent.x + 32));
			// 複数同時に発射する
			for (let speed = 8; speed < 32; speed += 4) {
				this.parent.level.add(
					new ShieldAttack(this.parent.level, this.parent.x + 32, this.parent.y + 32, direction, speed)
				);
			}
			this.parent.shield.hide();
			yield* this.sleep(80, () => entities.update());
			this.parent.setState(new Default(this.parent));
		}
	}
	export class LaserAttackState<P extends Boss1> extends Default<P> {
		*move(): IterableIterator<void> {
			const x_org = this.parent.x;
			const move_x_dist = 48;
			const move_x_speed = 4;
			// 後ろに移動
			for (let i = 0; i * move_x_speed < move_x_dist; i++) {
				this.parent.x += move_x_speed;
				yield;
			}
			this.parent.x = x_org + move_x_dist;
			const rings = [
				new Ring(this.parent.level, this.parent.x + 32, this.parent.y + 32, 15, 1),
				new Ring(this.parent.level, this.parent.x + 32, this.parent.y + 32, 45, 1),
				new Ring(this.parent.level, this.parent.x + 32, this.parent.y + 32, 75, 1),
				new Ring(this.parent.level, this.parent.x + 32, this.parent.y + 32, 45, -1),
				new Ring(this.parent.level, this.parent.x + 32, this.parent.y + 32, 45 * 3, -1)
			];
			for (const ring of rings) {
				this.parent.level.add(ring);
			}
			let flg_shrink = false;
			rings[0].ee.once("shrink", () => {
				flg_shrink = true;
			});
			// リングの収縮まで待つ
			while (!flg_shrink) {
				yield;
			}
			// リングが最も小さくなったタイミングで発射
			const laser = new Laser(this.parent.level, this.parent.x - 48, this.parent.y + 32);
			this.parent.level.add(laser);
			for (let i = 0; i < 4; i++) {
				this.parent.level.add(new Orbit(this.parent.level, this.parent.x + 32 - 8, this.parent.y + 32, 102));
				this.parent.level.add(new Orbit(this.parent.level, this.parent.x + 32 + 8, this.parent.y + 32, 78));
				yield* this.sleep(30);
				this.parent.level.add(new Orbit(this.parent.level, this.parent.x + 32 - 8, this.parent.y + 32, 12));
				this.parent.level.add(new Orbit(this.parent.level, this.parent.x + 32 + 8, this.parent.y + 32, -12));
				yield* this.sleep(30);
			}
			yield* this.sleep(50);
			// 攻撃終了
			for (const ring of rings) {
				ring.hide();
			}
			yield* this.sleep(10);
			laser.end();
			yield* this.sleep(24);

			// 元の位置に戻る
			for (let i = 0; i * move_x_speed < move_x_dist; i++) {
				this.parent.x -= move_x_speed;
				yield;
			}
			this.parent.x = x_org;
			this.parent.setState(new Default(this.parent));
		}
	}
	export class Damage<P extends Boss1> extends AbstractState<P> {
		init(): void {
			this.parent.sprite_normal.visible = false;
			this.parent.sprite_damage.visible = true;
		}
		*update(): IterableIterator<void> {
			yield* this.sleep(16);
			if (this.parent.hp > 0) {
				this.parent.shield.show();
				yield* this.sleep(6, () => this.parent.shield.update());
				this.parent.setState(new Default(this.parent));
			} else {
				yield* this.sleep(8);
				this.parent.setState(new Die(this.parent));
			}
		}
	}
	export class Die<P extends Boss1> extends AbstractState<P> {
		init(): void {
			this.parent.sprite_normal.visible = false;
			this.parent.sprite_damage.visible = false;
			this.parent.healthbar.container.visible = false;
			this.parent.healthbar.kill();
			this.parent.kill();
		}
		*update(): IterableIterator<void> {}
	}
}
