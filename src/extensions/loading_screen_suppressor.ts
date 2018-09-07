import { Extension } from "../definitions/extension";
import { Graphics } from "../definitions/graphics";

/**
 * ローディング画面表示中はGraphicsを用いた画面描写ができないため、ローディング画面を消してGraphicsによる描画を有効化する
 */
// tslint:disable-next-line:variable-name
export class LoadingScreenSuppressorExtension implements Extension {
	inject(mc: any, options: any): void {
		const self = this;
		// userInit()のタイミングでメソッドを書き換えないのはmc.paint()の初回呼び出しに間に合わないため
		// ローディング画面を表示せず、常にGraphicsの描画内容を転写する
		mc.paint = function(graphics: Graphics) {
			if (!this.mp.draw_lock_f) {
				graphics.drawImage(this.gg.os_img, 0, 0);
			}
		};
	}
}
