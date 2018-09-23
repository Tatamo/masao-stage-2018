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
	get ee(): PIXI.utils.EventEmitter {
		return this._ee;
	}
	private readonly _ee: PIXI.utils.EventEmitter;
	constructor(level: Level, x: number, y: number) {
		super();
		this._level = level;
		this._alive = true;
		this._container = new PIXI.Container();
		this._container.x = x;
		this._container.y = y;
		this._ee = new PIXI.utils.EventEmitter();
	}
	kill() {
		this._alive = false;
	}
	update() {
		if (this.done && this.alive) this.kill();
		else super.update();
	}
}
