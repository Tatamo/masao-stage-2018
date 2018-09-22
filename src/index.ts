import { format } from "masao";
import json from "../public/assets/game.json";
import assets from "../public/assets/assets.json";
import { launch } from "./launch";
import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";

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

launch(params, am!, assets);

/*
// canvasを試しに作ってみる
const make = () => {
	const renderer = PIXI.autoDetectRenderer({
		// forceCanvas: true,
		width: 64,
		height: 64,
		transparent: true
	});
	const c = document.createElement("canvas");
	c.width = c.height = 64;
	const ctx = c.getContext("2d")!;
	const grad = ctx.createRadialGradient(16, 16, 10, 16, 16, 14);
	// const grad = ctx.createRadialGradient(20, 20, 10, 20, 20, 16);
	ctx.fillStyle = grad;
	grad.addColorStop(0, "#ffffff00");
	grad.addColorStop(0.4, "#ffffffff");
	grad.addColorStop(0.6, "#ffffffff");
	grad.addColorStop(1, "#ffffff00");
	ctx.scale(2, 2);
	ctx.arc(16, 16, 16, 0, 2 * Math.PI);
	ctx.fill();
	const sprite = PIXI.Sprite.from(c);
	sprite.filters = [new GlowFilter(4, 2, 0, 0xff0000)];
	renderer.render(sprite);
	return renderer.view;
};

document.body.appendChild(make());
*/
