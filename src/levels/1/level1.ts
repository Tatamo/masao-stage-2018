import { AbstractLevel } from "../level";
import * as PIXI from "pixi.js";
import { HealthBar } from "../../healthbar";
import { MAX_HP } from "../../main";

export class Level1 extends AbstractLevel {
	private readonly health_bar: HealthBar;
	constructor(root: PIXI.Container, resources: PIXI.loaders.ResourceDictionary, jss: any) {
		super(root, resources, jss);
		this.health_bar = new HealthBar(this.stage, this.resources, this.jss, MAX_HP);
		this.jss.setMyMaxHP(MAX_HP);
	}
	update() {
		this.health_bar.update();
	}
	render() {
		this.health_bar.render();
	}
}
