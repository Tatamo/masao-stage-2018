export interface State<P extends StateMachine> {
	readonly parent: P;

	/**
	 * 現在のStateに移った際、最初のupdateの直前に呼び出される
	 */
	init(): void;

	/**
	 * 毎フレーム呼び出される処理をジェネレータを用いて定義する
	 */
	update(): IterableIterator<void>;

	/**
	 * 描画処理
	 */
	render(): void;
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
	abstract render(): void;
}

export class StateMachine {
	get done(): boolean {
		return this._done;
	}
	private state: State<this> | null;
	private flg_initialized: boolean;
	private flg_loop: boolean;
	private _done: boolean;
	private generator: IterableIterator<void> | null;
	constructor() {
		this.state = null;
		this.flg_initialized = false;
		this.flg_loop = true;
		this._done = false;
		this.generator = null;
	}
	setState(state: State<this>, loop: boolean = true): void {
		this.state = state;
		this.flg_loop = loop;
		this.flg_initialized = false;
		this._done = false;
		this.generator = state.update();
	}
	update(): void {
		// 状態が設定されていない場合は何もしない
		if (this.state === null) return;
		// 初期化
		if (!this.flg_initialized) {
			this.flg_initialized = true;
			this.state.init();
		}
		// ジェネレータを回して処理
		if (this.generator !== null) {
			const { done } = this.generator.next();
			if (done) {
				if (this.flg_loop) {
					// 終了後、loopフラグがONなら再度同じ処理を行う
					this.generator = this.state.update();
				} else {
					this.generator = null;
					this._done = true;
				}
			}
		}
	}
	render(): void {
		if (this.state !== null) this.state.render();
	}
}
