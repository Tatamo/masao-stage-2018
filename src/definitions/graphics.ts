export interface ImageBuff {
	getGraphics(): Graphics;
}

export interface Graphics {
	_ctx: CanvasRenderingContext2D;
	drawLine(x1: number, y1: number, x2: number, y2: number): boolean;
	drawImage(image: ImageBuff, x: number, y: number): boolean;
	drawImage(image: ImageBuff, x: number, y: number, width: number, height: number): boolean;
	drawImage(
		image: ImageBuff,
		sourceX: number,
		sourceY: number,
		sourceWidth: number,
		sourceHeight: number,
		drawX: number,
		drawY: number,
		drawWidth: number,
		drawHeight: number
	): boolean;
	drawRect(x: number, y: number, width: number, height: number): boolean;
	fillRect(x: number, y: number, width: number, height: number): boolean;
	drawOval(x: number, y: number, width: number, height: number): boolean;
	fillOval(x: number, y: number, width: number, height: number): boolean;
	drawArc(x: number, y: number, width: number, height: number, angle: number, theta: number): boolean;
	fillArc(x: number, y: number, width: number, height: number, angle: number, theta: number): boolean;
	drawPolygon(xa: number, ya: number, num: number): boolean;
	fillPolygon(xa: number, ya: number, num: number): boolean;
	drawString(str: string, x: number, y: number): boolean;
	setFont(font: number): boolean;
	setGlobalAlpha(alpha:number):boolean;
	setColor(color:any):boolean;
}
