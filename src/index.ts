import { format } from "masao";
import json from "./game.json";
import { Graphics } from "./definitions/graphics";
import { Main } from "./main";
import { OnImageLoadedCallbackExtension } from "./extensions/imageloadcallback";
import { InitCallbackExtension } from "./extensions/initcallback";
import { LoadingScreenSuppressorExtension } from "./extensions/loading_screen_suppressor";
import { Loader } from "./loader";
import { LoadCompleteWaiterExtension } from "./extensions/loadcompletewaiter";
import * as PIXI from "pixi.js";

// JSMasaoオブジェクトの型宣言を行っておく
interface JSMasaoOptions {
	extensions?: Array<object>;
	userJSCallback?: (offscreen_g: Graphics, mode: number, view_x: number, view_y: number, ap: any) => void;
	userHighscoreCallback?: (score: number) => void;
	"advance-map"?: object;
}

declare class JSMasao {
	constructor(params: object, id?: string, options?: JSMasaoOptions);
}

// masao-json-formatからパラメータオブジェクトを取得
const { params: p, "advanced-map": am } = format.load(json);

// パラメータを上書き
const params = {
	...p,
	now_loading: "ただいまファイルを読み込み中。しばらくお待ち下さい。", // バグのため初期値が反映されない
	filename_ending: "assets/images/ending.gif",
	filename_gameover: "assets/images/gameover.gif",
	filename_haikei: "assets/images/haikei.gif",
	filename_haikei2: "assets/images/haikei.gif",
	filename_haikei3: "assets/images/haikei.gif",
	filename_haikei4: "assets/images/haikei.gif",
	filename_mapchip: "assets/images/mapchip.gif",
	filename_pattern: "assets/images/pattern.gif",
	filename_title: "assets/images/title.gif",
	se_switch: "1",
	se_filename: "2", // バグのため本来のパラメータと反対になっている
	filename_se_start: "assets/sounds/item.mp3",
	filename_se_gameover: "assets/sounds/gameover.mp3",
	filename_se_clear: "assets/sounds/clear.mp3",
	filename_se_coin: "assets/sounds/coin.mp3",
	filename_se_get: "assets/sounds/get.mp3",
	filename_se_item: "assets/sounds/item.mp3",
	filename_se_jump: "assets/sounds/jump.mp3",
	filename_se_sjump: "assets/sounds/sjump.mp3",
	filename_se_kiki: "assets/sounds/kiki.mp3",
	filename_se_fumu: "assets/sounds/fumu.mp3",
	filename_se_tobasu: "assets/sounds/tobasu.mp3",
	filename_se_fireball: "assets/sounds/shot.mp3",
	filename_se_jet: "assets/sounds/mgan.mp3",
	filename_se_miss: "assets/sounds/dosun.mp3",
	filename_se_block: "assets/sounds/bakuhatu.mp3",
	filename_se_mizu: "assets/sounds/mizu.mp3",
	filename_se_dengeki: "assets/sounds/mgan.mp3",
	filename_se_happa: "assets/sounds/happa.mp3",
	filename_se_hinoko: "assets/sounds/mgan.mp3",
	filename_se_mizudeppo: "assets/sounds/happa.mp3",
	filename_se_bomb: "assets/sounds/shot.mp3",
	filename_se_dosun: "assets/sounds/dosun.mp3",
	filename_se_grounder: "assets/sounds/mgan.mp3",
	filename_se_kaiole: "assets/sounds/happa.mp3",
	filename_se_senkuuza: "assets/sounds/shot.mp3",
	filename_se_dokan: "assets/sounds/get.mp3",
	filename_se_chizugamen: "assets/sounds/get.mp3"
};

const { init, onload, userjs } = (() => {
	const loader = new Loader();
	let main: Main | null = null;
	return {
		init: (mc: any, graphics: Graphics, jss: any) => {
			PIXI.loader.add("pattern", "assets/images/pattern.gif");
			PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
				LoadCompleteWaiterExtension.go();
				main = new Main(jss, graphics, resources);
			});
		},
		onload: (mc: any, graphics: Graphics, jss: any) => {},
		userjs: (graphics: Graphics, mode: number, view_x: number, view_y: number, ap: any) => {
			main!.userJS(mode, view_x, view_y);
		}
	};
})();
InitCallbackExtension.on(init);
OnImageLoadedCallbackExtension.on(onload);
// ゲームオブジェクトを作成
// tslint:disable-next-line:no-unused-expression
new JSMasao(params, undefined, {
	userJSCallback: userjs,
	extensions: [
		InitCallbackExtension,
		OnImageLoadedCallbackExtension,
		LoadingScreenSuppressorExtension,
		LoadCompleteWaiterExtension
	],
	"advance-map": am
});
