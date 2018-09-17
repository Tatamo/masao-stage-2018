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
			new PIXI.Sprite(
				level.api.resource.registerIfNecessary("laser1_body", () => {
					const c = document.createElement("canvas");
					c.width = c.height = 64;
					const ctx = c.getContext("2d")!;
					const grad = ctx.createRadialGradient(28, 16, 2, 16, 16, 16);
					grad.addColorStop(0, "#ffffff00");
					grad.addColorStop(0.5, "#ffffff00");
					grad.addColorStop(0.9, "#ffffffff");
					grad.addColorStop(1, "#ffffff00");
					ctx.fillStyle = grad;
					ctx.scale(1, 2);
					ctx.arc(16, 16, 16, 0, 2 * Math.PI);
					ctx.fill();
					return PIXI.Texture.fromCanvas(c);
				})
			),
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
