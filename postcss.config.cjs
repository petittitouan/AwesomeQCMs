const purgecss = require("@fullhuman/postcss-purgecss");
const tailwindcss = require("tailwindcss");

const dev = process.argv[process.argv.indexOf("--mode") + 1] === "development";

module.exports = {
    plugins: [
        "postcss-preset-env",
        "tailwindcss"
    ].concat(dev ? [] : [
        purgecss({
            content: ["./web/**/*.html"]
        })
    ])
};
