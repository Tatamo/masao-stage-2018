import { Entity } from "../../entity";
import { EntityContainer } from "../../container";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { Energy } from "./energy";

/**
 * 光が集まるエフェクト
 */
export class ChargeEffect extends Entity {
	public readonly entities: EntityContainer;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.entities = new EntityContainer(this.container);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends ChargeEffect> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			for (let i = 0; i < 6; i++) {
				for (let ii = 0; ii < 30; ii++) {
					this.parent.entities.add(
						new Energy(
							this.parent.level,
							0,
							0,
							Math.random() * 2 * Math.PI,
							16 + 16 * Math.random(),
							20 + 20 * Math.random()
						)
					);
				}
				this.parent.entities.update();
				yield;
			}
			// 子供が全員死ぬまでは死なない
			while (this.parent.entities.size > 0) {
				this.parent.entities.update();
				yield;
			}
		}
		render(): void {
			this.parent.entities.render();
		}
	}
}
