import { Graphics } from "./definitions/graphics";

export interface State<P extends StateMachine> {
	readonly parent: P;
	init(ap: any): void;
	update(ap: any): IterableIterator<void>;
	draw(graphics: Graphics, ap: any): void;
}

export interface StateConstructor<P extends StateMachine> {
	new (p: P): State<P>;
}

export interface StateMachine {
	setState(state: State<StateMachine>, loop?: boolean): void;
	update(ap: any): void;
	draw(graphics: Graphics, ap: any): void;
}

export class AbstractState<P extends StateMachine> implements State<P> {
	constructor(private _parent: P) {}
	get parent(): P {
		return this._parent;
	}
	init(ap: any): void {}
	*update(ap: any): IterableIterator<void> {}
	draw(graphics: Graphics, ap: any): void {}
}

export class AbstractStateMachine implements StateMachine {
	private state: State<this> | null;
	private flg_initialized: boolean;
	private flg_loop: boolean;
	private generator: IterableIterator<void> | null;
	constructor() {
		this.state = null;
		this.flg_initialized = false;
		this.flg_loop = true;
		this.generator = null;
	}
	setState(state: State<this>, loop: boolean = true): void {
		this.state = state;
		this.flg_loop = loop;
	}
	update(ap: any): void {
		// 状態が設定されていない場合は何もしない
		if (this.state === null) return;
		// 初期化
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.state.init(ap);
			this.generator = this.state.update(ap);
		}
		// ジェネレータを回して処理
		if (this.generator !== null) {
			const { done } = this.generator.next();
			// 終了後、loopフラグがONなら再度同じ処理を行う
			if (done && this.flg_loop) {
				this.generator = this.state.update(ap);
			}
		}
	}
	draw(graphics: Graphics, ap: any): void {
		if (this.state !== null) this.state.draw(graphics, ap);
	}
}
