import { AbstractLevel } from "./level";
import { HealthBar } from "../component/information/healthbar";
import { MAX_HP } from "../../main";
import { GameAPI } from "../api";
import { Boss1 } from "../component/entities/enemy/boss1";

export class Stage1 extends AbstractLevel {
	private readonly health_bar: HealthBar;
	constructor(api: GameAPI) {
		super(api);
		this.health_bar = new HealthBar(api, this.stage, MAX_HP);
		api.jss.setMyMaxHP(MAX_HP);
		this.entities.add(new Boss1(this, 384, 800 + 320));
	}
	update() {
		this.health_bar.update();
		this.entities.update();
	}
	render() {
		this.health_bar.render();
		this.entities.render();
	}
}
