import * as PIXI from "pixi.js";
import { Graphics } from "./definitions/graphics";
import { HealthBar } from "./healthbar";

export class Main {
	private flg_initialized: boolean;
	private max_hp: number;
	private health_bar: HealthBar | null;
	private readonly renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
	private readonly base_sprite: PIXI.Sprite;
	private readonly base_ctx: CanvasRenderingContext2D;
	private readonly root: PIXI.Container;
	private stage: PIXI.Container | null;
	constructor(private readonly jss: any, graphics: Graphics) {
		this.flg_initialized = false;
		this.max_hp = 10;
		this.renderer = PIXI.autoDetectRenderer({
			width: 512,
			height: 320
		});
		this.root = new PIXI.Container();
		this.base_sprite = PIXI.Sprite.from(graphics._ctx.canvas);
		this.base_ctx = graphics._ctx;
		this.root.addChild(this.base_sprite);
		this.stage = null;
		this.health_bar = null;
	}
	public onLoad() {
		// this.base_sprite.texture.update();
		this.renderer.render(this.root);
	}

	public userJS(mode: number, view_x: number, view_y: number): void {
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.userInitJS();
		}

		if (mode === 1) {
			// タイトル画面
			this.userTitleJS();
		} else if (mode >= 100 && mode < 200) {
			if (this.jss.getJSMes() >= 1) {
				// ゲーム開始
				this.jss.setJSMes(0);
				this.userGameStartJS();
			} else {
				// ゲーム中
				this.userGameJS(view_x, view_y);
			}
		} else if (mode === 200) {
			// ゲームオーバー
			this.userGameoverJS();
		} else if (mode === 300) {
			// エンディング
			this.userEndingJS();
		}
	}

	public userInitJS(): void {
		// this.base_sprite.texture.update();
	}

	public userTitleJS(): void {
		this.base_ctx.drawImage(this.renderer.view, 0, 0);
	}

	public userGameStartJS(): void {
		// 前のステージ用のコンテナが存在する場合はrootから取り除く
		if (this.stage !== null) {
			this.root.removeChild(this.stage);
			this.stage.destroy();
		}
		this.stage = new PIXI.Container();
		this.root.addChild(this.stage);
		this.health_bar = new HealthBar(this.stage, this.jss, this.max_hp);
		this.jss.setMyMaxHP(this.max_hp);
		this.base_ctx.drawImage(this.renderer.view, 0, 0);
	}

	public userGameJS(view_x: number, view_y: number): void {
		this.health_bar!.update();
		this.render();
	}

	public userGameoverJS(): void {}

	public userEndingJS(): void {}

	public render(): void {
		this.health_bar!.draw();
		this.base_sprite.texture.update();
		this.renderer.render(this.root);
		this.base_ctx.drawImage(this.renderer.view, 0, 0);
	}
}
