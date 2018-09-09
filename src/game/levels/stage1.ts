import { AbstractLevel } from "./level";
import { HealthBar } from "../component/information/healthbar";
import { MAX_HP } from "../../main";
import { GameAPI } from "../api";
import { Boss1 } from "../component/entities/enemy/boss1";

export class Stage1 extends AbstractLevel {
	constructor(api: GameAPI) {
		super(api);
		api.jss.setMyMaxHP(MAX_HP);
		this.entities.add(new HealthBar(this, MAX_HP));
		this.entities.add(new Boss1(this, 384, 800 + 320));
	}
}
