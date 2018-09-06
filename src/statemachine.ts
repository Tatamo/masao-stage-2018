export interface State<P extends StateMachine> {
	readonly parent: P;
	init(): void;
	update(): IterableIterator<void>;
	draw(): void;
}

export interface StateConstructor<P extends StateMachine> {
	new (p: P): State<P>;
}

export abstract class AbstractState<P extends StateMachine> implements State<P> {
	constructor(private _parent: P) {}
	get parent(): P {
		return this._parent;
	}
	abstract init(): void;
	abstract update(): IterableIterator<void>;
	abstract draw(): void;
}

export class StateMachine {
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
	update(): void {
		// 状態が設定されていない場合は何もしない
		if (this.state === null) return;
		// 初期化
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.state.init();
			this.generator = this.state.update();
		}
		// ジェネレータを回して処理
		if (this.generator !== null) {
			const { done } = this.generator.next();
			// 終了後、loopフラグがONなら再度同じ処理を行う
			if (done && this.flg_loop) {
				this.generator = this.state.update();
			}
		}
	}
	draw(): void {
		if (this.state !== null) this.state.draw();
	}
}
