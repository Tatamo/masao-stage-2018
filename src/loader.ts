import * as PIXI from "pixi.js";

export class Loader {
	private readonly loader: PIXI.loaders.Loader;
	private mc_loaded: boolean;
	private pixi_loaded: boolean;
	private readonly _resources: Map<string, PIXI.loaders.Resource>;
	get resources(): Map<string, PIXI.loaders.Resource> {
		return this._resources;
	}
	constructor() {
		this.mc_loaded = false;
		this.pixi_loaded = false;
		this.loader = new PIXI.loaders.Loader();
		this._resources = new Map<string, PIXI.loaders.Resource>();
		this.register();
		this.load();
	}
	private register() {
		this.loader.add("pattern", "assets/images/pattern.gif");
	}
	private load() {
		this.loader.load(this.onLoadPIXI.bind(this));
	}
	onLoadMC() {
		this.mc_loaded = true;
	}
	onLoadPIXI(loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) {
		for (const [key, resource] of Object.entries(resources)) {
			this._resources.set(key, resource);
		}
		this.pixi_loaded = true;
	}
	isLoaded(): boolean {
		return this.mc_loaded && this.pixi_loaded;
	}
}
