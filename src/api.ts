import * as PIXI from "pixi.js";
import { Graphics } from "./definitions/graphics";
export interface GameAPI {
	readonly jss: any;
	readonly graphics: Graphics;
	readonly root: PIXI.Container;
	readonly resources: PIXI.loaders.ResourceDictionary;
}
