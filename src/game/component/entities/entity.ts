import * as PIXI from "pixi.js";
import { StateMachine } from "../../statemachine";
import { GameAPI } from "../../api";
import { Level } from "../../levels/level";

export class Entity extends StateMachine {
	get container(): PIXI.Container {
		return this._container;
	}
	private _container: PIXI.Container;
	get alive(): boolean {
		return this._alive;
	}
	private _alive: boolean;
	get api(): GameAPI {
		return this.level.api;
	}
	get x(): number {
		return this.container.x;
	}
	set x(value: number) {
		this.container.x = value;
	}
	get y(): number {
		return this.container.y;
	}
	set y(value: number) {
		this.container.y = value;
	}
	get level(): Level {
		return this._level;
	}
	private readonly _level: Level;
	constructor(level: Level) {
		super();
		this._level = level;
		this._alive = true;
		this._container = new PIXI.Container();
	}
	kill() {
		this._alive = false;
	}
	update() {
		super.update();
		if (this.done && this.alive) this.kill();
	}
}
