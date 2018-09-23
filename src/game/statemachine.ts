export interface State<P extends StateMachine> {
	readonly parent: P;

	/**
	 * 現在のStateに移った際に呼び出される
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
	init(): void {}
	*update(): IterableIterator<void> {}
	render(): void {}
	// noinspection JSMethodCanBeStatic
	protected *sleep(time: number, cb?: () => void): IterableIterator<void> {
		for (let i = 0; i < time; i++) {
			if (cb !== undefined) cb();
			yield;
		}
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * 主人公にダメージを与える
	 * @param jss:any MasaoJSS
	 * @param damage:number ダメージ量
	 * @param type:number このダメージで主人公が死亡した場合のミスの種類
	 */
	protected damage(jss: any, damage: number, type: number) {
		// 主人公にダメージ
		jss.setMyHPDamage(damage);

		// 主人公が死亡
		if (jss.getMyHP() <= 0) {
			jss.setMyMiss(type);
		}
	}
}

interface StateControlBlock<P extends StateMachine> {
	done: boolean;
	readonly loop: boolean;
	state_changed_in_update: boolean;
	readonly state: State<P>;
	generator: IterableIterator<void>;
}

export class StateMachine {
	get done(): boolean {
		if (this.state_stack.length === 0) return true;
		return this.state_stack[this.state_stack.length - 1].done;
	}
	set done(value: boolean) {
		if (this.state_stack.length === 0) return;
		this.state_stack[this.state_stack.length - 1].done = value;
	}
	private get loop(): boolean {
		if (this.state_stack.length === 0) return true;
		return this.state_stack[this.state_stack.length - 1].loop;
	}
	private get state_changed_in_update(): boolean {
		if (this.state_stack.length === 0) return false;
		return this.state_stack[this.state_stack.length - 1].state_changed_in_update;
	}
	private set state_changed_in_update(value: boolean) {
		if (this.state_stack.length === 0) return;
		this.state_stack[this.state_stack.length - 1].state_changed_in_update = value;
	}
	private get state(): State<this> | null {
		if (this.state_stack.length === 0) return null;
		return this.state_stack[this.state_stack.length - 1].state;
	}
	private get generator(): IterableIterator<void> | null {
		if (this.state_stack.length === 0) return null;
		return this.state_stack[this.state_stack.length - 1].generator;
	}
	// private state: State<this> | null;
	// private flg_loop: boolean;
	// update()の実行中にsetStateが呼ばれたことを知るためのフラグ
	// private flg_state_changed_in_update: boolean;
	// private _done: boolean;
	// private generator: IterableIterator<void> | null;
	private readonly state_stack: Array<StateControlBlock<this>>;
	constructor() {
		this.state_stack = [];
	}
	private regenerate(): void {
		const len = this.state_stack.length;
		if (len === 0) return;
		this.done = false;
		this.state_stack[len - 1].generator = this.state_stack[len - 1].state.update();
	}
	setState(state: State<this>, loop: boolean = true): void {
		this.state_stack.length = 0;
		this.pushState(state, loop);
	}
	pushState(state: State<this>, loop: boolean = true): void {
		this.state_stack.push({
			state,
			loop,
			done: false,
			state_changed_in_update: true,
			generator: state.update()
		});
		// 初期化
		this.state!.init();
	}
	popState() {
		if (this.state_stack.length > 0) this.state_stack.length -= 1;
		this.state_changed_in_update = true;
	}
	update(): void {
		this.state_changed_in_update = false;
		// 状態が設定されていない場合は何もしない
		if (this.state === null) return;
		// ジェネレータを回して処理
		if (this.generator !== null) {
			// update()途中でstateが変わった場合はgeneratorも置き換わっているので何もしなくてよい
			if (this.generator.next().done && this.state_changed_in_update === false) {
				this.done = true;
				// スタックをポップできるところまでポップする
				while (this.state_stack.length > 0 && this.done) {
					if (this.loop) {
						// 終了後、loopフラグがONなら再度同じ処理を行う
						this.regenerate();
					} else {
						this.state_stack.length -= 1;
					}
				}
			}
		}
	}
	render(): void {
		if (this.state !== null) this.state.render();
	}
}
