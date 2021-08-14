const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require("path")
const webpack = require("webpack")

module.exports = merge(common, {
    mode: "development",
    devtool: "source-map",
    devServer: {
        publicPath: "/dist",
        contentBase: ["./", path.join(__dirname, "dist")],
        compress: true,
        port: 3000,
        hot: true,
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            SOUND_ENABLED: false,
            SPEED: 1,
        }),
    ],
})
