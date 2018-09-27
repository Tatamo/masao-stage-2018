import { Entity } from "../../entity";
import * as PIXI from "pixi.js";
import { Level } from "../../../../levels/level";
import { AbstractState } from "../../../../statemachine";
import { easeOutCubic } from "../../../../../utils/easing";
import { VIEW_HEIGHT } from "../../../../../main";

export class LockOnEffect extends Entity {
	public readonly sprite: PIXI.Sprite;
	public readonly sprite2: PIXI.Sprite;
	public readonly textures: Array<PIXI.Texture>;
	constructor(level: Level, x: number, y: number) {
		super(level, x, y);
		this.textures = [];
		this.textures.push(
			level.api.resource.registerIfNecessary("target_moving", () => {
				const c = document.createElement("canvas");
				c.width = c.height = 32;
				const ctx = c.getContext("2d")!;
				ctx.strokeStyle = "#00ff00";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(16, 1);
				ctx.lineTo(1, 16);
				ctx.lineTo(16, 31);
				ctx.lineTo(31, 16);
				ctx.closePath();
				ctx.stroke();
				return PIXI.Texture.from(c);
			})
		);
		this.textures.push(
			level.api.resource.registerIfNecessary("target_locked", () => {
				const c = document.createElement("canvas");
				c.width = c.height = 32;
				const ctx = c.getContext("2d")!;
				ctx.strokeStyle = "#ff0000";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(16, 1);
				ctx.lineTo(1, 16);
				ctx.lineTo(16, 31);
				ctx.lineTo(31, 16);
				ctx.closePath();
				ctx.stroke();
				return PIXI.Texture.from(c);
			})
		);
		this.sprite = new PIXI.Sprite(this.textures[0]);
		this.sprite.anchor.set(0.5);
		this.container.addChild(this.sprite);
		this.sprite2 = new PIXI.Sprite(this.textures[0]);
		this.sprite2.anchor.set(0.5);
		this.sprite2.scale.set(2);
		this.container.addChild(this.sprite2);
		this.setState(new States.Default(this), false);
	}
}
namespace States {
	export class Default<P extends LockOnEffect> extends AbstractState<P> {
		init(): void {}
		*update(): IterableIterator<void> {
			const start_x = this.parent.x;
			const { jss } = this.parent.api;
			const easing = easeOutCubic;
			const ds = 2 - Math.sqrt(2);
			// 移動中
			for (let i = 0; i < 40; i++) {
				const tx = jss.getMyXReal() + 16;
				const ty = jss.getMyYReal() + 16;
				const dx = jss.getMyXReal() !== -1 ? tx - this.parent.x : 0;
				const dy = jss.getMyYReal() !== -1 ? ty - this.parent.y : 0;
				const d2 = dx * dx + dy * dy;
				const max_speed = 12 + Math.floor(i / 5);
				if (d2 > max_speed * max_speed) {
					const dist = Math.sqrt(d2);
					this.parent.x += (dx * max_speed) / dist;
					this.parent.y += (dy * max_speed) / dist;
				} else {
					this.parent.x += dx;
					this.parent.y += dy;
				}
				this.parent.y = Math.max(this.parent.y, jss.getViewYReal() + 80);
				this.parent.y = Math.min(this.parent.y, jss.getViewYReal() + VIEW_HEIGHT - 48 - 2);
				this.parent.x = Math.min(this.parent.x, start_x);
				this.parent.sprite2.scale.set(2 - ds * easing(i / 40));
				this.parent.sprite2.rotation = ((i / 40) * Math.PI) / 4;
				yield;
			}
			this.parent.sprite2.scale.set(Math.sqrt(2));
			this.parent.sprite2.rotation = Math.PI / 4;
			this.parent.sprite.texture = this.parent.textures[1];
			this.parent.sprite2.texture = this.parent.textures[1];
			this.parent.container.x += 1;
			this.parent.container.y -= 1;
			this.parent.ee.emit("locked");
			yield* this.sleep(65);
		}
		render(): void {}
	}
}
