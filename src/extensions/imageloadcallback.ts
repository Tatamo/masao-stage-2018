import { Extension } from "../definitions/extension";
import { Graphics } from "../definitions/graphics";

/**
 * ローディング終了タイミングでコールバックを実行する
 */
// tslint:disable-next-line:variable-name
export const OnImageLoadedCallbackExtension = new class implements Extension {
	private callbacks: Array<(mc: any, graphics: Graphics, jss: any) => void>;
	constructor() {
		this.callbacks = [];
	}
	inject(mc: any, options: any): void {
		const self = this;
		const _ui = mc.userInit;
		mc.userInit = function() {
			_ui.apply(mc);
			const _run = mc.run;
			mc.run = function() {
				_run.apply(mc);
				if (mc.th_jm === 1) {
					self.emit(mc);
				}
			};
		};
	}
	private emit(mc: any) {
		for (const callback of this.callbacks) {
			callback(mc, mc.gg.os_g_bk, mc.masaoJSSAppletEmulator);
		}
	}
	on(callback: (mc: any, graphics: Graphics, jss: any) => void) {
		this.callbacks.push(callback);
	}
}();
