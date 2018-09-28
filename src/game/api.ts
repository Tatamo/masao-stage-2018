import * as PIXI from "pixi.js";
import { Graphics } from "../definitions/graphics";
import Resource from "./resource";
export interface GameAPI {
	readonly jss: any;
	readonly graphics: Graphics;
	readonly root: PIXI.Container;
	readonly resource: Resource;
}
