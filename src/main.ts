import * as PIXI from "pixi.js";
import { Graphics } from "./definitions/graphics";
import { HealthBar } from "./healthbar";

export class Main {
	private flg_initialized: boolean;
	private max_hp: number;
	private health_bar: HealthBar | null;
	private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer | null;
	private stage: PIXI.Container;

	constructor() {
		this.flg_initialized = false;
		this.max_hp = 10;
		this.health_bar = null;
		this.renderer = null;
		this.stage = new PIXI.Container();
	}

	public userJS(graphics: Graphics, mode: number, view_x: number, view_y: number, ap: any): void {
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.userInitJS(graphics, ap);
		}

		if (mode === 1) {
			// タイトル画面
			this.userTitleJS(graphics, ap);
		} else if (mode >= 100 && mode < 200) {
			if (ap.getJSMes() >= 1) {
				// ゲーム開始
				ap.setJSMes(0);
				this.userGameStartJS(graphics, ap);
			} else {
				// ゲーム中
				this.userGameJS(graphics, view_x, view_y, ap);
			}
		} else if (mode === 200) {
			// ゲームオーバー
			this.userGameoverJS(graphics, ap);
		} else if (mode === 300) {
			// エンディング
			this.userEndingJS(graphics, ap);
		}
	}

	public userInitJS(graphics: Graphics, ap: any): void {
		this.renderer = PIXI.autoDetectRenderer({
			width: 512,
			height: 320,
			view: graphics._ctx.canvas,
			transparent: true, // いらない気がする
			clearBeforeRender: false
		});
	}

	public userTitleJS(graphics: Graphics, ap: any): void {}

	public userGameStartJS(graphics: Graphics, ap: any): void {
		ap.setMyMaxHP(this.max_hp);
		this.health_bar = new HealthBar(this.max_hp);
	}

	public userGameJS(graphics: Graphics, view_x: number, view_y: number, ap: any): void {
		this.health_bar!.update(ap);
		this.health_bar!.draw(graphics, ap);
		if (this.renderer !== null) this.renderer.render(this.stage);
	}

	public userGameoverJS(graphics: Graphics, ap: any): void {}

	public userEndingJS(graphics: Graphics, ap: any): void {}
}
