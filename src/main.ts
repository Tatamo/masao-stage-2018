import * as PIXI from "pixi.js";
import { Graphics } from "./definitions/graphics";
import { HealthBar } from "./healthbar";

export class Main {
	private flg_initialized: boolean;
	private max_hp: number;
	private health_bar: HealthBar | null;
	private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer | null;
	private base_sprite: PIXI.Sprite | null;
	private readonly stage: PIXI.Container;
	constructor(private readonly jss: any) {
		this.flg_initialized = false;
		this.max_hp = 10;
		this.health_bar = null;
		this.renderer = null;
		this.base_sprite = null;
		this.stage = new PIXI.Container();
	}

	public userJS(graphics: Graphics, mode: number, view_x: number, view_y: number): void {
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.userInitJS(graphics);
		}

		if (mode === 1) {
			// タイトル画面
			this.userTitleJS(graphics);
		} else if (mode >= 100 && mode < 200) {
			if (this.jss.getJSMes() >= 1) {
				// ゲーム開始
				this.jss.setJSMes(0);
				this.userGameStartJS(graphics);
			} else {
				// ゲーム中
				this.userGameJS(graphics, view_x, view_y);
			}
		} else if (mode === 200) {
			// ゲームオーバー
			this.userGameoverJS(graphics);
		} else if (mode === 300) {
			// エンディング
			this.userEndingJS(graphics);
		}
	}

	public userInitJS(graphics: Graphics): void {
		this.renderer = PIXI.autoDetectRenderer({
			width: 512,
			height: 320
		});
		this.base_sprite = PIXI.Sprite.from(graphics._ctx.canvas);
		this.stage.addChild(this.base_sprite);
	}

	public userTitleJS(graphics: Graphics): void {}

	public userGameStartJS(graphics: Graphics): void {
		this.jss.setMyMaxHP(this.max_hp);
		this.health_bar = new HealthBar(this.stage, this.jss, this.max_hp);
	}

	public userGameJS(graphics: Graphics, view_x: number, view_y: number): void {
		this.health_bar!.update(this.jss);
		this.render(graphics);
	}

	public userGameoverJS(graphics: Graphics): void {}

	public userEndingJS(graphics: Graphics): void {}

	public render(graphics: Graphics): void {
		this.health_bar!.draw(graphics, this.jss);
		this.base_sprite!.texture.update();
		this.renderer!.render(this.stage);
		graphics._ctx.drawImage(this.renderer!.view, 0, 0);
	}
}
