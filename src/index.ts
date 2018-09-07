import { format } from "masao";
import json from "./game.json";
import { launch } from "./launch";

// masao-json-formatからパラメータオブジェクトを取得
const { params: p, "advanced-map": am } = format.load(json);

// パラメータを上書き
const params = {
	...p,
	score_v: 2, // スコア非表示
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

const pixi_resources = [
	{ name: "pattern", path: "assets/images/pattern.gif" },
	{ name: "health_bar", path: "assets/images/health_bar.png" }
];

launch(params, am!, pixi_resources);
