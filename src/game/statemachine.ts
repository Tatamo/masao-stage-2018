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

export class StateMachine {
	get done(): boolean {
		return this._done;
	}
	private state: State<this> | null;
	private flg_loop: boolean;
	// update()の実行中にsetStateが呼ばれたことを知るためのフラグ
	private flg_state_changed_in_update: boolean;
	private _done: boolean;
	private generator: IterableIterator<void> | null;
	constructor() {
		this.state = null;
		this.flg_loop = true;
		this.flg_state_changed_in_update = false;
		this._done = false;
		this.generator = null;
	}
	setState(state: State<this>, loop: boolean = true): void {
		this.state = state;
		this.flg_loop = loop;
		this.flg_state_changed_in_update = true;
		this._done = false;
		this.generator = state.update();
		// 初期化
		this.state.init();
	}
	update(): void {
		this.flg_state_changed_in_update = false;
		// 状態が設定されていない場合は何もしない
		if (this.state === null) return;
		// ジェネレータを回して処理
		if (this.generator !== null) {
			// update()途中でstateが変わった場合はgeneratorも置き換わっているので何もしなくてよい
			if (this.generator.next().done && this.flg_state_changed_in_update === false) {
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
