const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: "./modules/Browser/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: "file-loader",
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "./modules/Browser/index.html" }),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
}
