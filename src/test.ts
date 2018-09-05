import { Graphics } from "./definitions/graphics";

export interface Child<P extends Parent> {
	parent: P;
}

export interface Parent {
	child: Child<any> | null;
	setChild(child: Child<any>): void;
}

export class AbstractChild<P extends Parent> implements Child<P> {
	constructor(public parent: P) {}
}

export class ExChild1<P extends Parent> extends AbstractChild<P> {}
export class ExChild2<P extends AbstractParent> extends AbstractChild<P> {}
export class ExChild3 extends AbstractChild<AbstractParent> {} // ジェネリクスに具体的な型を指定する

export class AbstractParent implements Parent {
	child: Child<any> | null;
	constructor() {
		this.child = null;
	}
	setChild(child: Child<any>) {
		this.child = child;
	}
	foo() {
		this.setChild(new AbstractChild(this));
		this.setChild(new ExChild1(this));
		this.setChild(new ExChild2(this));
		this.setChild(new ExChild3(this));
		/*
		TS2345: Argument of type 'ExChild3' is not assignable to parameter of type 'Child<this>'.
		Types of property 'parent' are incompatible.
		Type 'AbstractParent' is not assignable to type 'this'.
		 */
	}
}

const p = new AbstractParent();
p.setChild(new ExChild3(p)); // クラス定義の外では問題ない

/*
export class ExParent extends AbstractParent {
	bar() {
		this.setChild(new AbstractChild(this));
		this.setChild(new ExChild(this));
	}
}
*/

/*
export interface State<P extends StateMachine> {
	readonly parent: P;
}

export interface StateMachine {
	setState(state: State<this>, loop?: boolean): void;
}

export class AbstractState<P extends StateMachine> implements State<P> {
	constructor(private _parent: P) {}
	get parent(): P {
		return this._parent;
	}
}

export class AbstractStateMachine implements StateMachine {
	private state: State<this> | null;
	constructor() {
		this.state = null;
	}
	setState(state:State<this>, loop?:boolean):void{
		this.state = state;
	}
	foo(){
		this.setState(new AbstractState(this));
		this.setState(new ExState2(this));
	}
}


export class ExState<P extends StateMachine> extends AbstractState<P> {}
export class ExState2<P extends AbstractStateMachine> extends AbstractState<P> {}
export clas
*/
