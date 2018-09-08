import { Extension } from "../definitions/extension";
import { Graphics } from "../definitions/graphics";

/**
 * MasaoConstructionオブジェクト作成直後にコールバックを実行する
 */
export class InitCallbackExtension implements Extension {
	constructor(private readonly callback: (mc: any, graphics: Graphics, jss: any) => void) {}
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
		this.callback(mc, mc.gg.os_g_bk, mc.masaoJSSAppletEmulator);
	}
}
