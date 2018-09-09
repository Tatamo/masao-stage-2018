import { Entity } from "../entity";
import { Level } from "../../../levels/level";

/**
 * ボス1
 */
export abstract class Enemy extends Entity {
	public hp: number;
	constructor(level: Level, x: number, y: number, hp: number) {
		super(level, x, y);
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
