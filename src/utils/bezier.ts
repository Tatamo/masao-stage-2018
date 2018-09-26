interface Point {
	x: number;
	y: number;
}
export const quadraticBezierCurve = (p0: Point, p1: Point, p2: Point) => {
	return (t: number) => ({
		x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
		y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y
	});
};
