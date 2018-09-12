import { Entity } from "../../entity";
import { EntityContainer } from "../../container";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { SlitEffect } from "../atom/slit";
import { ShockWaveEffect } from "../atom/shockwave";

/**
 * 主人公が敵を攻撃した際のエフェクト
 */
export class PlayerAttack extends Entity {
	public readonly entities: EntityContainer;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.entities = new EntityContainer(this.container);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends PlayerAttack> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			for (let i = 0; i < 2; i++) {
				for (let ii = 0; ii < 30 - i * 12; ii++) {
					this.parent.entities.add(
						new SlitEffect(
							this.parent.level,
							0,
							0,
							Math.random() * 2 * Math.PI,
							(2 - i) * 12 + (0.4 + 0.6 * Math.random()) * 28
						)
					);
				}
				for (let ii = 0; ii < 2 - i; ii++) {
					const size_init = ((Math.random() * 2 + 1) * 32) / 3;
					const size_end = ((Math.random() * 2 + 1) * 96) / 3;
					this.parent.entities.add(
						new ShockWaveEffect(
							this.parent.level,
							0,
							0,
							((Math.random() * 2 - 1) * Math.PI) / 4,
							size_init * 2,
							size_init,
							size_end * 2,
							size_end
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
