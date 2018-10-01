import { AbstractLevel } from "./level";
import { GameAPI } from "../api";
import { EndingEffect } from "../component/entities/effect/ending";

export class Ending extends AbstractLevel {
	constructor(api: GameAPI) {
		super(api);
		this.add(new EndingEffect(this));
	}
}
