import { Graphics } from "./definitions/graphics";
import { AbstractState, StateMachine } from "./statemachine";

export class HealthBar extends StateMachine {
	public current_hp: number;
	constructor(public max_hp: number) {
		super();
		this.current_hp = max_hp;
		this.setState(new HBState(this));
	}
}

class HBState<P extends HealthBar> extends AbstractState<P> {
	init(ap: any): void {
		this.parent.current_hp = this.parent.max_hp;
	}
	*update(ap: any): IterableIterator<void> {
		this.parent.current_hp = ap.getMyHP();
	}
	draw(graphics: Graphics, ap: any): void {
		graphics.fillRect(32, 32, 128 * (this.parent.current_hp / this.parent.max_hp), 32);
	}
}
