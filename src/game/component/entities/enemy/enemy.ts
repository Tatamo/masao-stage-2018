import { Entity } from "../entity";
import { GameAPI } from "../../../api";

/**
 * ボス1
 */
export abstract class Enemy extends Entity {
	public hp: number;
	constructor(api: GameAPI, x: number, y: number, hp: number) {
		super(api);
		this.container.x = x;
		this.container.y = y;
		this.hp = hp;
	}
	/**
	 * 自身にダメージを与え、ダメージを受けた後のHPが0未満であれば0に修正します
	 * @param value 与えるダメージ
	 * @return boolean 残りHPが0より大きければtrue そうでなければfalse
	 */
	damage(value: number): boolean {
		this.hp -= value;
		if (this.hp < 0) this.hp = 0;
		return this.hp > 0;
	}
}
