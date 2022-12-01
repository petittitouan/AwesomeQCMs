const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const dev = process.argv[process.argv.indexOf("--mode") + 1] === "development";

module.exports = {
    entry: {
        index: "./web/assets/js/index.js",
        admin: "./web/assets/js/admin.js"
    },
    watch: dev,
    output: {
        path: path.resolve("./dist/web/assets"),
        filename: dev ? "[name].js" : "[name].[chunkhash:8].js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    dev ? "style-loader" : MiniCSSExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader"
                ].concat(dev ? [] : ["postcss-loader"]),
                sideEffects: true
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
    optimization: {
        minimizer: [
            `...`,
            new CssMinimizerPlugin()
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./web/index.html",
            filename: "../index.html",
            chunks: ["index"]
        }),
        new HtmlWebpackPlugin({
            template: "!!raw-loader!./web/views/admin.ejs",
            filename: "../views/admin.ejs",
            chunks: ["admin"]
        })
    ].concat(dev ? [
        // DEVELOPMENT-ONLY PLUGINS
        // Nothing Here
    ] : [
        // PRODUCTION-ONLY PLUGINS
        new MiniCSSExtractPlugin()
    ])
};
