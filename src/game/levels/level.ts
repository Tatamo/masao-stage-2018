import * as PIXI from "pixi.js";
import { GameAPI } from "../api";
import { Entity } from "../component/entities/entity";
import { EntityContainer } from "../component/entities/container";

export interface Level {
	readonly stage: PIXI.Container;
	add(entitiy: Entity): void;
	/**
	 * 毎フレームの更新処理
	 */
	update(): void;

	/**
	 * 描画処理
	 */
	render(): void;

	/**
	 * 現在のレベルを破棄し、以後描画されなくなる
	 * このメソッドの呼び出し後はオブジェクトを操作しないこと
	 */
	kill(): void;
}

export abstract class AbstractLevel implements Level {
	get stage(): PIXI.Container {
		return this._stage;
	}
	protected readonly entities: EntityContainer;
	protected _stage: PIXI.Container;
	protected constructor(protected readonly api: GameAPI) {
		this._stage = new PIXI.Container();
		this.entities = new EntityContainer(api, this.stage);
		this.api.root.addChild(this.stage);
	}
	add(entity: Entity) {
		this.entities.add(entity);
	}
	abstract update(): void;
	abstract render(): void;
	kill() {
		this.stage.visible = false;
		this.api.root.removeChild(this.stage);
		this.stage.destroy();
	}
}
