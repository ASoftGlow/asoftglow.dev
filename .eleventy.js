//@ts-check

/**@param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "passthrough": "." });

    eleventyConfig.setLiquidOptions({
        jsTruthy: true
    });
};