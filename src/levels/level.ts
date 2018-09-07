import * as PIXI from "pixi.js";

export interface Level {
	init(): void;
	update(): void;
	render(): void;
}

export abstract class AbstractLevel {
	protected readonly stage: PIXI.Container;
	protected constructor(
		protected readonly root: PIXI.Container,
		protected readonly resources: PIXI.loaders.ResourceDictionary,
		protected readonly jss: any
	) {
		this.stage = new PIXI.Container();
		root.addChild(this.stage);
	}
	abstract init(): void;
	abstract update(): void;
	abstract render(): void;
}
