import { AbstractLevel } from "./level";
import { HealthBar } from "../component/entities/information/healthbar";
import { MAX_HP } from "../../main";
import { GameAPI } from "../api";
import { Boss1 } from "../component/entities/enemy/boss1";
import * as PIXI from "pixi.js";
import { PlayerAttack } from "../component/entities/effect/playerattack";
import { Ring } from "../component/entities/attack/ring";

export class Stage1 extends AbstractLevel {
	constructor(api: GameAPI) {
		super(api);
		const { jss } = api;
		jss.setMyMaxHP(MAX_HP);
		this.add(new HealthBar(this, MAX_HP));
		this.add(new Boss1(this, 384 + 32, 192 + 320));
		// this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, 0, 1));
		// this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, 0, -1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (0 / 4) * Math.PI, 1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (1 / 4) * Math.PI, 1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (1 / 4) * Math.PI, -1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (3 / 4) * Math.PI, -1));
		/*
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (0 / 6) * Math.PI, 1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (2 / 6) * Math.PI, 1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (4 / 6) * Math.PI, 1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (1 / 6) * Math.PI, -1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (2 / 6) * Math.PI, -1));
		this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (3 / 6) * Math.PI, -1));
		*/
		// this.add(new Ring(this, 384 + 32 + 32, 192 + 32 + 320, (2 / 3) * Math.PI, -1));

		// 主人公の行動を監視する
		const ee: PIXI.utils.EventEmitter = jss.createPlayerEventEmitter();
		ee.on("fumu", () => {
			// 敵を踏んだ時にエフェクトを発生させる
			this.add(new PlayerAttack(this, jss.getMyXReal() + 16, jss.getMyYReal() + 32));
		});
		ee.on("miss", () => {
			// もう使わないのでEventEmitterの登録を解除する
			jss.removePlayerEventEmitter(ee);
		});
	}
}
