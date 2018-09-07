import { Extension } from "../definitions/extension";
import { Graphics } from "../definitions/graphics";

// tslint:disable-next-line:variable-name
export const InitCallbackExtension = new class implements Extension {
	private callbacks: Array<(mc: any, graphics: Graphics, jss: any) => void>;
	constructor() {
		this.callbacks = [];
	}
	inject(mc: any, options: any): void {
		const self = this;
		// userInitではなくinit_jに差し込む (他のエクステンションの初期化完了を待つため)
		const _init_j = mc.init_j;
		mc.init_j = function() {
			_init_j.apply(mc);
			self.emit(mc);
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
