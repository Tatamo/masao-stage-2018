import { Entity } from "../../../entity";
import { EntityContainer } from "../../../container";
import { Level } from "../../../../../levels/level";
import { AbstractState } from "../../../../../statemachine";
import { Orb } from "./orb";

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
		constructor(parent: P, private readonly timespan: number = 60) {
			super(parent);
		}
		init(): void {}
		*update(): IterableIterator<void> {
			for (let i = 0; i < this.timespan; i++) {
				for (let ii = 0; ii < 12; ii++) {
					const orb = new Orb(this.parent.level, 0, 0, 1 + i / 30);
					this.parent.ee.once("shrink", () => orb.shrink());
					this.parent.entities.add(orb);
				}
				this.parent.entities.update();
				yield;
			}
			this.parent.ee.emit("shrink");
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
