const path = require("path");
module.exports = {
	mode: process.env.WEBPACK_SERVE ? "development" : "production",
	context: path.resolve(__dirname, "src"),
	entry: "./index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js"
	},
	resolve: {
		extensions: [".ts", ".js", ".json"]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				enforce: "pre",
				loader: "tslint-loader",
				options: {
					typeCheck: true,
					fix: true
				}
			},
			{
				test: /\.(ts|js)$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			},
			{ test: /\.ts$/, loader: "ts-loader" }
		]
	}
};
