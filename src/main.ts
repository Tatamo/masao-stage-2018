import * as PIXI from "pixi.js";
import { Graphics } from "./definitions/graphics";
import { Level } from "./components/levels/level";
import { Stage1 } from "./components/levels/stage1";
import { GameAPI } from "./components/api";
import { Resource } from "./components/resource";

export const MAX_HP = 10;

export class Main {
	private flg_initialized: boolean;
	private readonly renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
	private readonly base_sprite: PIXI.Sprite;
	private readonly base_ctx: CanvasRenderingContext2D;
	private readonly api: GameAPI;
	private level: Level | null;
	constructor(jss: any, graphics: Graphics, resource: Resource) {
		this.flg_initialized = false;
		this.renderer = PIXI.autoDetectRenderer({
			// forceCanvas: true,
			width: 512,
			height: 320
		});
		const root = new PIXI.Container();
		this.base_sprite = PIXI.Sprite.from(graphics._ctx.canvas);
		this.base_ctx = graphics._ctx;
		root.addChild(this.base_sprite);
		this.api = { jss, graphics, root, resource };
		this.level = null;
	}

	public userJS(mode: number): void {
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.userInitJS();
		}

		if (mode === 1) {
			// タイトル画面
			this.userTitleJS();
		} else if (mode >= 100 && mode < 200) {
			if (this.api.jss.getJSMes() >= 1) {
				// ゲーム開始
				this.api.jss.setJSMes(0);
				this.userGameStartJS();
			} else {
				// ゲーム中
				this.userGameJS();
			}
		} else if (mode === 200) {
			// ゲームオーバー
			this.userGameoverJS();
		} else if (mode === 300) {
			// エンディング
			this.userEndingJS();
		}
		this.render();
	}

	public userInitJS(): void {}

	public userTitleJS(): void {
		this.removeLevel();
	}

	public userGameStartJS(): void {
		this.level = new Stage1(this.api);
	}

	public userGameJS(): void {
		this.level!.update();
	}

	public userGameoverJS(): void {
		this.removeLevel();
	}

	public userEndingJS(): void {
		this.removeLevel();
	}

	private removeLevel(): void {
		// 以前使用したLevelが存在する場合は消去
		if (this.level !== null) {
			this.level.kill();
			this.level = null;
		}
	}
	public render(): void {
		if (this.level !== null) this.level.render();
		// CanvasMasao側で書き込まれたCanvasの内容を反映
		this.base_sprite.texture.update();
		// PIXI.jsによる描画
		this.renderer.render(this.api.root);
		// 描画結果を再度CanvasMasao側のcanvasに転写
		this.base_ctx.drawImage(this.renderer.view, 0, 0);
	}
}
