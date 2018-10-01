import * as PIXI from "pixi.js";
import { Entity } from "./entity";

export class EntityContainer {
	get alive(): boolean {
		return this._alive;
	}
	private _alive: boolean;
	get container(): PIXI.Container {
		return this._container;
	}
	private readonly _container: PIXI.Container;
	get size(): number {
		return this.children.length;
	}
	private children: Array<Entity | null>;

	/**
	 * @param container
	 * @param as_a_child boolean default:true falseにすると第一引数で与えられたコンテナをそのまま使用するが、trueの場合は自身で新しくコンテナを作成して子として追加する
	 */
	constructor(container: PIXI.Container, as_a_child: boolean = true) {
		this._alive = true;
		if (as_a_child) {
			this._container = new PIXI.Container();
			container.addChild(this._container);
		} else {
			this._container = container;
		}
		this.children = [];
	}
	add(child: Entity) {
		this._container.addChild(child.container);
		this.children.push(child);
	}
	update() {
		// ループ開始前の子要素の数を使ってループ
		const len = this.children.length;
		for (let i = 0; i < len; i++) {
			const child = this.children[i];
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
				this._container.removeChild(this.children[i]!.container);
				this.children[i]!.container.destroy({ children: true });
				this.children[i] = null;
			}
		}
		// nullの要素を取り除く O(n)
		const tmp = this.children;
		this.children = [];
		for (const child of tmp) {
			if (child !== null) this.children.push(child);
		}
	}
	render() {
		for (const child of this.children) {
			if (child !== null) {
				child.render();
			}
		}
	}
	destroy() {
		this.container.visible = false;
		this.container.destroy();
		this._alive = false;
	}
}
