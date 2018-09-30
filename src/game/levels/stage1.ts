import { AbstractLevel } from "./level";
import { HealthBar } from "../component/entities/information/healthbar";
import { MAX_HP } from "../../main";
import { GameAPI } from "../api";
import { Boss1 } from "../component/entities/enemy/boss1";
import * as PIXI from "pixi.js";
import { PlayerAttack } from "../component/entities/effect/playerattack";
import { DamageEffect } from "../component/entities/effect/damage";
import { Bomb } from "../component/entities/attack/bomb";

export class Stage1 extends AbstractLevel {
	constructor(api: GameAPI) {
		super(api);
		const { jss } = api;
		jss.setMyMaxHP(MAX_HP);
		this.add(new HealthBar(this, MAX_HP));
		this.add(new Boss1(this, 384 + 32, 192 + 320));
		this.add(new Bomb(this, 160 + 16 + 32, 32 + 320));

		// 主人公の行動を監視する
		const ee: PIXI.utils.EventEmitter = jss.createPlayerEventEmitter();
		ee.on("fumu", () => {
			// 敵を踏んだ時にエフェクトを発生させる
			this.add(new PlayerAttack(this, jss.getMyXReal() + 16, jss.getMyYReal() + 32));
		});
		ee.on("damage", (damage: number, prev_x: number, prev_y: number) => {
			const x = jss.getMyXReal() === -1 ? prev_x : jss.getMyXReal();
			const y = jss.getMyYReal() === -1 ? prev_y : jss.getMyYReal();
			this.add(new DamageEffect(this, x + 16, y, damage));
		});
		ee.on("miss", () => {
			// もう使わないのでEventEmitterの登録を解除する
			jss.removePlayerEventEmitter(ee);
		});
	}
}
