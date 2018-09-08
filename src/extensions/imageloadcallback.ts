import { Extension } from "../definitions/extension";
import { Graphics } from "../definitions/graphics";

/**
 * ローディング終了タイミングでコールバックを実行する
 */
export class OnImageLoadedCallbackExtension implements Extension {
	private emitted: boolean;
	constructor(private readonly callback: (mc: any, graphics: Graphics, jss: any) => void) {
		this.emitted = false;
	}
	inject(mc: any, options: any): void {
		const self = this;
		const _ui = mc.userInit;
		mc.userInit = function() {
			_ui.apply(mc);
			const _run = mc.run;
			mc.run = function() {
				_run.apply(mc);
				if (mc.th_jm === 1 && !self.emitted) {
					self.emit(mc);
				}
			};
		};
	}
	private emit(mc: any) {
		this.emitted = true;
		this.callback(mc, mc.gg.os_g_bk, mc.masaoJSSAppletEmulator);
	}
}
