import { Entity } from "../../../entity";
import { EntityContainer } from "../../../container";
import { Level } from "../../../../../levels/level";
import { AbstractState } from "../../../../../statemachine";
import { Trace } from "./trace";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../../../../../../main";

export class TraceEffect extends Entity {
	public readonly entities: EntityContainer;
	constructor(level: Level, x: number, y: number, public readonly tx: number, public readonly ty: number) {
		super(level, x, y);
		this.entities = new EntityContainer(this.container);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends TraceEffect> extends AbstractState<P> {
		constructor(parent: P, private readonly timespan: number = 60) {
			super(parent);
		}
		init(): void {}
		*update(): IterableIterator<void> {
			const mx = this.parent.api.jss.getViewXReal() + VIEW_WIDTH;
			const my = this.parent.api.jss.getViewYReal() + VIEW_HEIGHT * Math.random();
			for (let i = 0; i < this.timespan; i++) {
				for (let ii = 0; ii < 8; ii++) {
					this.parent.entities.add(
						new Trace(
							this.parent.level,
							0,
							0,
							this.parent.tx - this.parent.x,
							this.parent.ty - this.parent.y,
							mx - this.parent.x,
							my - this.parent.y,
							ii / 8
						)
					);
				}
				this.parent.entities.update();
				console.log(this.parent.entities.size);
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
