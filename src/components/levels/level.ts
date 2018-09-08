import * as PIXI from "pixi.js";
import { GameAPI } from "../api";

export interface Level {
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

export abstract class AbstractLevel {
	protected readonly stage: PIXI.Container;
	protected constructor(protected readonly api: GameAPI) {
		this.stage = new PIXI.Container();
		this.api.root.addChild(this.stage);
	}
	abstract update(): void;
	abstract render(): void;
	kill() {
		this.api.root.removeChild(this.stage);
		this.stage.destroy();
	}
}
