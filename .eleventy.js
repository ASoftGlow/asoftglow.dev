//@ts-check
// Don’t forget to `npm install sass`!
const sass = require("sass");
const path = require("path");

/**@param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "passthrough": "." });

    eleventyConfig.setLiquidOptions({
        jsTruthy: true
    });

    eleventyConfig.addTemplateFormats("scss");
    /**@type {sass.StringOptions<"sync">} */
    const sassConfig = {
        loadPaths: ["css"],
        style: "compressed"
    };

    // Creates the extension for use
    eleventyConfig.addExtension("scss", {
        outputFileExtension: "css", // optional, default: "html"

        // `compile` is called once per .scss file in the input directory
        /**
         * @param {string} inputContent
         * @param {string} inputPath
         */
        compile: async function (inputContent, inputPath) {
            let parsed = path.parse(inputPath);
            if (parsed.name.startsWith("_")) {
                return;
            }
            let result = sass.compileString(inputContent, sassConfig);

            // This is the render function, `data` is the full data cascade
            return async (data) => {
                return result.css;
            };
        }
    });
};