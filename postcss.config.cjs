const purgecss = require("@fullhuman/postcss-purgecss");

const dev = process.argv[process.argv.indexOf("--mode") + 1] === "development";

module.exports = {
    plugins: [
        "postcss-preset-env"
    ].concat(dev ? [] : [
        purgecss({
            content: ["./web/**/*.html"]
        })
    ])
};
