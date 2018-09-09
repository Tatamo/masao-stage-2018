import { AbstractLevel } from "./level";
import { HealthBar } from "../component/information/healthbar";
import { MAX_HP } from "../../main";
import { GameAPI } from "../api";
import { EntityContainer } from "../component/entities/container";
import { Boss1 } from "../component/entities/enemy/boss1";

export class Stage1 extends AbstractLevel {
	private readonly health_bar: HealthBar;
	private readonly enemies: EntityContainer;
	constructor(api: GameAPI) {
		super(api);
		this.health_bar = new HealthBar(api, this.stage, MAX_HP);
		api.jss.setMyMaxHP(MAX_HP);
		this.enemies = new EntityContainer(api, this.stage);
		this.enemies.add(new Boss1(api, 384, 800));
	}
	update() {
		this.health_bar.update();
		this.enemies.update();
	}
	render() {
		this.health_bar.render();
		this.enemies.render();
	}
}
