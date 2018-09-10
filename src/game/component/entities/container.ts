import * as PIXI from "pixi.js";
import { Entity } from "./entity";

export class EntityContainer {
	get container(): PIXI.Container {
		return this._container;
	}
	private readonly _container: PIXI.Container;
	get size(): number {
		return this.children.length - this.unused_stack.length;
	}
	private readonly children: Array<Entity | null>;
	private readonly unused_stack: Array<number>;
	constructor(parent: PIXI.Container) {
		this._container = new PIXI.Container();
		parent.addChild(this._container);
		this.children = [];
		this.unused_stack = [];
	}
	add(child: Entity) {
		this._container.addChild(child.container);
		if (this.unused_stack.length > 0) {
			this.children[this.unused_stack.pop()!] = child;
		} else {
			this.children.push(child);
		}
	}
	update() {
		for (const child of this.children) {
			if (child !== null) {
				child.update();
			}
		}
		// 死んでいるものがあれば消す
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i] !== null && !this.children[i]!.alive) {
				// 非表示化
				this.children[i]!.container.visible = false;
				// 破棄
				this.children[i]!.container.destroy({ children: true });
				this.children[i] = null;
				this.unused_stack.push(i);
			}
		}
	}
	render() {
		for (const child of this.children) {
			if (child !== null) {
				child.render();
			}
		}
	}
}
