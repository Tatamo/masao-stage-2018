module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {test: /\.ts$/, loader: "ts-loader"}
        ]
    }
};