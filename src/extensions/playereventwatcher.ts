import { Extension } from "../definitions/extension";
import { Graphics } from "../definitions/graphics";
import EventEmitter = PIXI.utils.EventEmitter;

type PlayerParams = {
	j_jump_level: number;
	j_jump_type: number;
	j_muteki_c: number;
	j_hp: number;
	co_j: { c: number; pt: number; vx: number; vy: number };
};

/**
 * 主人公の動きを監視し、イベントの発生を通知する
 */
// tslint:disable-next-line:variable-name
export class PlayerEventWatcherExtension implements Extension {
	private player!: PlayerParams;
	private player_prev!: PlayerParams;

	private event_emmiters: Array<EventEmitter>;
	constructor() {
		this.event_emmiters = [];
	}

	inject(mc: any, options: any): void {
		const self = this;
		const _ui = mc.userInit;
		mc.userInit = function() {
			_ui.apply(mc);
			self.player = PlayerEventWatcherExtension.getPlayerParams(mc);
			self.player_prev = PlayerEventWatcherExtension.getPlayerParams(mc);
			// MasaoJSSにメソッドを追加
			if (mc.masaoJSSAppletEmulator !== null) {
				mc.masaoJSSAppletEmulator.createPlayerEventEmitter = () => self.create();
				mc.masaoJSSAppletEmulator.removePlayerEventEmitter = (ee: EventEmitter) => self.remove(ee);
			}
		};
		const _usersub = mc.userSub;
		mc.userSub = function(g: Graphics, img: any) {
			_usersub(g, img);
			self.watch(mc);
		};
	}
	watch(mc: any) {
		this.player_prev = this.player;
		this.player = PlayerEventWatcherExtension.getPlayerParams(mc);
		const prv = this.player_prev;
		const crr = this.player;

		if (prv.j_muteki_c === 0 && crr.j_muteki_c > 0) {
			this.emit("damage", prv.j_hp - crr.j_hp);
		}
		if (crr.j_jump_type !== prv.j_jump_type && crr.j_jump_type === 0 && crr.j_jump_level !== 0) {
			this.emit("jump", crr.j_jump_level);
		}
		if (crr.co_j.c !== prv.co_j.c) {
			switch (crr.co_j.c) {
				case 110:
					switch (crr.co_j.vy) {
						case -220:
							this.emit("fumu", 2);
							break;
						case -320:
							this.emit("fumu", 3);
							break;
						default:
							this.emit("fumu", 1);
					}
					break;
				case 200:
					this.emit("miss", 2);
					break;
				case 210:
					this.emit("miss", 1);
					break;
				case 220:
					this.emit("miss", 3);
					break;
				case 230:
					this.emit("miss", 4);
					break;
				case 240:
					this.emit("miss", 5);
					break;
			}
		}
	}

	emit(eventname: string, ...args: Array<any>) {
		for (const ee of this.event_emmiters) {
			ee.emit(eventname, ...args);
		}
	}
	/**
	 * 新しいEventEmitterを生成します
	 */
	create(): EventEmitter {
		const ee = new EventEmitter();
		this.event_emmiters.push(ee);
		return ee;
	}

	/**
	 * 指定されたEventEmitterを削除します
	 * @param ee
	 */
	remove(ee: EventEmitter) {
		for (let i = this.event_emmiters.length - 1; i >= 0; i--) {
			if (this.event_emmiters[i] === ee) {
				this.event_emmiters.splice(i, 1);
				break;
			}
		}
	}
	static getPlayerParams(mc: any): PlayerParams {
		const { c, pt, vx, vy } = mc.mp.co_j;
		const { j_jump_level, j_jump_type, j_muteki_c, j_hp } = mc.mp;
		return { j_jump_level, j_jump_type, j_muteki_c, j_hp, co_j: { c, pt, vx, vy } };
	}
}
