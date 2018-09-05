import { Graphics } from "./definitions/graphics";
import { HealthBar } from "./healthbar";

export class Main {
	private flg_initialized: boolean;
	private max_hp: number;
	private healthbar: HealthBar;

	constructor() {
		this.flg_initialized = false;
		this.max_hp = 10;
		this.healthbar = new HealthBar(this.max_hp);
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

	public userInitJS(graphics: Graphics, ap: any): void {}

	public userTitleJS(graphics: Graphics, ap: any): void {}

	public userGameStartJS(graphics: Graphics, ap: any): void {
		ap.setMyMaxHP(this.max_hp);
	}

	public userGameJS(graphics: Graphics, view_x: number, view_y: number, ap: any): void {
		this.healthbar.update(ap);
		this.healthbar.draw(graphics, ap);
	}

	public userGameoverJS(graphics: Graphics, ap: any): void {}

	public userEndingJS(graphics: Graphics, ap: any): void {}
}
