import * as PIXI from "pixi.js";
import { Entity } from "./entity";
import { GameAPI } from "../../api";

export class EntityContainer {
	protected readonly container: PIXI.Container;
	private readonly children: Array<Entity | null>;
	private readonly unused_stack: Array<number>;
	constructor(protected readonly api: GameAPI, stage: PIXI.Container) {
		this.container = new PIXI.Container();
		stage.addChild(this.container);
		this.children = [];
		this.unused_stack = [];
	}
	add(child: Entity) {
		this.container.addChild(child.container);
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
		// 表示位置をマップ上の座標に合わせる
		this.container.x = -(this.api.jss.getViewXReal() - 32);
		this.container.y = -(this.api.jss.getViewYReal() - 320);
		for (const child of this.children) {
			if (child !== null) {
				child.render();
			}
		}
	}
}
