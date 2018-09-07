import { LoadCompleteWaiterExtension } from "./extensions/loadcompletewaiter";
import { Main } from "./main";
import { Graphics } from "./definitions/graphics";
import * as PIXI from "pixi.js";
import { InitCallbackExtension } from "./extensions/initcallback";
import { OnImageLoadedCallbackExtension } from "./extensions/imageloadcallback";
import { LoadingScreenSuppressorExtension } from "./extensions/loading_screen_suppressor";

// JSMasaoオブジェクトの型情報を宣言しておく
interface JSMasaoOptions {
	extensions?: Array<object>;
	userJSCallback?: (offscreen_g: Graphics, mode: number, view_x: number, view_y: number, ap: any) => void;
	userHighscoreCallback?: (score: number) => void;
	"advance-map"?: object;
}

declare class JSMasao {
	constructor(params: object, id?: string, options?: JSMasaoOptions);
}

/**
 * ゲームを起動する
 * @param params
 * @param advancemap
 */
export function launch(params: object, advancemap: object, resources: Array<{ name: string; path: string }>) {
	// ローディング周りの非同期処理が非常に煩雑なので汚いコードはここにまとめる
	const load_complete_waiter = new LoadCompleteWaiterExtension();
	let main: Main | null = null;
	const init = (mc: any, graphics: Graphics, jss: any) => {
		for (const { name, path } of resources) {
			PIXI.loader.add(name, path);
		}
		PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
			load_complete_waiter.go();
			main = new Main(jss, graphics, resources);
		});

		graphics._ctx.fillStyle = "#000000";
		graphics._ctx.fillRect(0, 0, 512, 320);
		graphics._ctx.fillStyle = "#ffffff";
		graphics._ctx.font = "16px sans-serif";

		graphics._ctx.fillText("ただいまファイルを読み込み中。しばらくお待ち下さい。", 32, 160);
	};
	const onload = (mc: any, graphics: Graphics, jss: any) => {};
	const userjs = (graphics: Graphics, mode: number) => {
		main!.userJS(mode);
	};
	// ゲームオブジェクトを作成
	// tslint:disable-next-line:no-unused-expression
	new JSMasao(params, undefined, {
		userJSCallback: userjs,
		extensions: [
			new InitCallbackExtension(init),
			new OnImageLoadedCallbackExtension(onload),
			new LoadingScreenSuppressorExtension(),
			load_complete_waiter
		],
		"advance-map": advancemap
	});
}
