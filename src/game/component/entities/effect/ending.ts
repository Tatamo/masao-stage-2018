import { Entity } from "../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../levels/level";
import { AbstractState } from "../../../statemachine";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../../../../main";

export class EndingEffect extends Entity {
	public readonly sprite: PIXI.Sprite;
	constructor(level: Level) {
		super(level, VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
		const { resource } = this.api;
		this.sprite = new PIXI.Sprite(resource.images["ending"]);
		this.sprite.anchor.set(0.5);
		this.sprite.alpha = 0.15;
		this.container.addChild(this.sprite);
		this.setState(new States.Default(this), false);
	}
}

namespace States {
	export class Default<P extends EndingEffect> extends AbstractState<P> {
		*update(): IterableIterator<void> {
			for (let i = 0; i < 20; i++) {
				this.parent.sprite.scale.set(1 + (0.5 * i) / 20);
				this.parent.sprite.alpha = 0.3 * (1 - i / 20);
				yield;
			}
		}
	}
}
