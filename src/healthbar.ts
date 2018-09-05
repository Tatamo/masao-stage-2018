import { Graphics } from "./definitions/graphics";

export class HealthBar {
	private current_hp: number;
	constructor(private max_hp: number) {
		this.current_hp = max_hp;
	}
	init(ap: any): void {
		this.current_hp = this.max_hp;
	}
	update(ap: any): void {
		this.current_hp = ap.getMyHP();
	}
	draw(graphics: Graphics, ap: any): void {
		graphics.fillRect(32, 32, 128 * (this.current_hp / this.max_hp), 32);
	}
}
