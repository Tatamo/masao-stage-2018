import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";

export class DamageEffect extends Entity {
	public readonly text: PIXI.Text;
	constructor(level: Level, x: number, y: number, damage: number, type: number = 0) {
		super(level, x, y);
		const style = (() => {
			switch (type) {
				case 1:
					// 敵にダメージを与えたときのエフェクト
					return new PIXI.TextStyle({
						fill: ["#00ffff", "#00cccc"],
						fontFamily: "monospace",
						fontSize: 16,
						fontWeight: "bold",
						padding: 3,
						strokeThickness: 0
					});
				case 0:
				// 通常ダメージ
				// fall through
				default:
					return new PIXI.TextStyle({
						fill: ["#ff0000", "#ff3333"],
						fontFamily: "monospace",
						fontSize: 16,
						fontWeight: "bold",
						padding: 3,
						stroke: "red",
						strokeThickness: 0
					});
			}
		})();
		this.text = new PIXI.Text(`${damage}`, style);
		this.text.anchor.x = 0.5;
		this.text.anchor.y = 0.5;
		this.container.addChild(this.text);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends DamageEffect> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			const vx = (Math.random() - 0.5) * 4;
			let vy = -14 - Math.random() * 8;
			while (vy < 10) {
				this.parent.x += vx;
				this.parent.y += vy;
				vy += 4;
				(this.parent.text.style.fontSize as number) += 1;
				yield;
			}
			for (let i = 0; i < 3; i++) {
				this.parent.x += vx;
				yield;
			}
		}
		render(): void {}
	}
}
