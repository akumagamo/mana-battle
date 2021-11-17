const webpack = require("webpack")
const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
var path = require("path")
const CopyPlugin = require("copy-webpack-plugin")

const dir = name => path.join(__dirname, name)

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: {
            directory: dir("dist"),
        },
        compress: true,
        port: process.env.NODE_ENV === 'test' ? 3333 : 3000,
        hot: true,
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            SOUND_ENABLED: false,
            SPEED: 1,
        }),
        new CopyPlugin({
            patterns: [{ from: dir("assets"), to: dir("dist/assets") }],
        }),
    ],
})
