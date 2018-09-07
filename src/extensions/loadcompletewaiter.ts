import { Extension } from "../definitions/extension";

/**
 * ローディング終了タイミングで処理を止めて他の処理完了を待つ
 */
// tslint:disable-next-line:variable-name
export const LoadCompleteWaiterExtension = new class implements Extension {
	private wait: boolean;
	constructor() {
		this.wait = true;
	}
	go() {
		this.wait = false;
	}
	inject(mc: any, options: any): void {
		const self = this;
		const _ui = mc.userInit;
		mc.userInit = function() {
			_ui.apply(mc);
			const _run = mc.run;
			mc.run = function() {
				if (mc.th_jm === 1 && self.wait) {
					// 何も処理をせず再描画だけを行う
					mc.__repaint();
				} else {
					_run.apply(mc);
				}
			};
		};
	}
}();
