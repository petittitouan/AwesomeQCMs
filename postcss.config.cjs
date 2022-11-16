const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
    plugins: [
        "postcss-preset-env",
        purgecss({
            content: ["./web/**/*.html"]
        })
    ]
};
