import { ShockWaveEffect } from "../../effect/shockwave";
import { Level } from "../../../../levels/level";
import * as PIXI from "pixi.js";

export class SmoothShockWaveEffect extends ShockWaveEffect {
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
			new PIXI.Sprite(level.api.resource.images["shockwave_asymmetry"]),
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
