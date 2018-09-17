import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { ShockWaveEffect } from "../shockwave";

export class JaggyShockWaveEffect extends ShockWaveEffect {
	constructor(
		level: Level,
		x: number,
		y: number,
		rad: number = 0,
		width: number = 32,
		height: number = 32,
		width_end: number = 64,
		height_end: number = 64
	) {
		super(
			level,
			new PIXI.Sprite(level.api.resource.images["shockwave"]),
			x,
			y,
			rad,
			width,
			height,
			width_end,
			height_end
		);
	}
}
