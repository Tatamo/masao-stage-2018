import * as PIXI from "pixi.js";
import { AbstractState } from "../../../statemachine";
import Resource from "../../../resource";
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
import { DamageEffect } from "../effect/damage";
import { LockOnEffect } from "../effect/target/lockon";
import { RotateEffect } from "../effect/target/rotate";
import { TraceEffect } from "../effect/target/trace";
import { ChargeEffect } from "../effect/target/charge";
import { Explode } from "../effect/target/explode";

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
			this.parent.pushState(new AirRaidAttackState(this.parent));
			yield* this.sleep(24);
			this.parent.pushState(new LockOnAttackState(this.parent));
			yield* this.sleep(24);
			this.parent.pushState(new ChargeAttackState(this.parent));
			yield* this.sleep(24);
			this.parent.pushState(new ShieldAttackState(this.parent));
			yield;
			if (!this.parent.shield.on && !this.parent.shield.showing) {
				this.parent.shield.show();
			}
			yield* this.sleep(24);
			this.parent.pushState(new LaserAttackState(this.parent));
			yield* this.sleep(24);
		}
		attack() {
			this.parent.level.add(new Bullet1(this.parent.level, this.parent.x + 16, this.parent.y + 32));
		}
		checkCollision(): void {
			const { jss } = this.parent.api;
			const m_x = jss.getMyXReal();
			const m_y = jss.getMyYReal();
			// ボスにシールドがなく、主人公が降下中
			if (!this.parent.shield.on && jss.getMyVY() > 10) {
				// 主人公との当たり判定 (矩形)
				if (
					m_x <= this.parent.x + 64 &&
					m_x + 32 >= this.parent.x &&
					m_y < this.parent.y + 64 &&
					m_y + 32 >= this.parent.y
				) {
					// 主人公が踏む
					jss.setMyPress(3);
					jss.setMyYReal(this.parent.y + 8);

					// １０点加算
					jss.addScore(10);

					// ボスのHPを減らす
					this.parent.damage(20);
					this.parent.level.add(
						new DamageEffect(this.parent.level, this.parent.x + 32, this.parent.y + 32, 20, 1)
					);
					this.parent.pushState(new Damage(this.parent));
				}
			} else {
				const dx = m_x + 16 - (this.parent.x + 32);
				const dy = m_y + 16 - (this.parent.y + 32);
				// 円形の当たり判定
				if (dx * dx + dy * dy < (16 + 32) * (16 + 32)) {
					// 主人公にダメージ
					if (this.parent.shield.showing) {
						// シールド展開途中は受けるダメージが小さい
						this.damage(jss, 5, 2);
					} else {
						this.damage(jss, 10, 2);
					}
				}
			}
		}
	}
	export class ChargeAttackState<P extends Boss1> extends Default<P> {
		*move(): IterableIterator<void> {
			this.parent.level.add(new ChargeAttack(this.parent.level, this.parent.x - 8, this.parent.y + 32));
			yield* this.sleep(120);
			this.parent.popState();
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
			// 待機
			for (let i = 0; i < 80; i++) {
				entities.update();
				// 踏まれてダメージ状態に移行して戻ってきた場合、シールドが貼り直されると待機を終了する
				if (this.parent.shield.on && !this.parent.shield.showing) {
					break;
				}
				yield;
			}
			this.parent.popState();
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
			yield* this.sleep(40);
			// 攻撃終了
			for (const ring of rings) {
				ring.hide();
			}
			yield* this.sleep(20);
			laser.end();
			yield* this.sleep(24);

			// 元の位置に戻る
			for (let i = 0; i * move_x_speed < move_x_dist; i++) {
				this.parent.x -= move_x_speed;
				yield;
			}
			this.parent.x = x_org;
			this.parent.popState();
		}
	}
	export class LockOnAttackState<P extends Boss1> extends Default<P> {
		*move(): IterableIterator<void> {
			const loe = new LockOnEffect(this.parent.level, this.parent.x + 32, this.parent.y + 32);
			let flg_l = false;
			loe.ee.once("locked", () => {
				flg_l = true;
			});
			this.parent.level.add(loe);
			while (!flg_l) yield;
			// ロックオンした
			const tx = loe.x;
			const ty = loe.y;
			yield* this.sleep(10);
			this.parent.level.add(new RotateEffect(this.parent.level, this.parent.x - 32, this.parent.y + 32));
			yield* this.sleep(20);
			for (let i = 0; i < 5; i++) {
				this.parent.level.add(
					new TraceEffect(this.parent.level, this.parent.x - 32, this.parent.y + 32, tx, ty, i * 80)
				);
			}
			yield* this.sleep(35);
			this.parent.level.add(new ChargeEffect(this.parent.level, tx, ty));
			yield* this.sleep(74);

			const entities = new EntityContainer(this.parent.container);
			for (let i = 0; i < 3; i++) {
				entities.add(
					new SmoothShockWaveEffect(
						this.parent.level,
						tx - this.parent.x,
						ty - this.parent.y,
						0,
						400,
						400,
						0,
						0,
						24 - i
					)
				);
				entities.update();
				yield;
			}
			yield* this.sleep(6, () => entities.update());
			this.parent.level.add(new Explode(this.parent.level, tx, ty));
			yield* this.sleep(12, () => entities.update());
			this.parent.container.removeChild(entities.container);
			this.parent.popState();
		}
	}
	export class AirRaidAttackState<P extends Boss1> extends Default<P> {
		*move(): IterableIterator<void> {
			this.parent.level.add(new ChargeAttack(this.parent.level, this.parent.x - 8, this.parent.y + 32));
			this.parent.api.jss.setEnemy(8, 2, 23);
			yield* this.sleep(120);
			this.parent.popState();
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
				this.parent.sprite_normal.visible = true;
				this.parent.sprite_damage.visible = false;
				this.parent.popState();
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
