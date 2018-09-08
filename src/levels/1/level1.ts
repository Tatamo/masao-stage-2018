import { AbstractLevel } from "../level";
import { HealthBar } from "../../healthbar";
import { MAX_HP } from "../../main";
import { GameAPI } from "../../api";

export class Level1 extends AbstractLevel {
	private readonly health_bar: HealthBar;
	constructor(api:GameAPI) {
		super(api);
		this.health_bar = new HealthBar(this.api, this.stage, MAX_HP);
		this.api.jss.setMyMaxHP(MAX_HP);
	}
	update() {
		this.health_bar.update();
	}
	render() {
		this.health_bar.render();
	}
}
