//@ts-check

/**@param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "passthrough": "." });

    eleventyConfig.setLiquidOptions({
        jsTruthy: true
    });
    eleventyConfig.addShortcode("year", () => new Date().getFullYear().toString());
    eleventyConfig.addPairedShortcode("msg",
        /**@type {(c: string, a: string, d: string) => string} */(content, author, date) => /*html*/`
        <li role="article" aria-roledescription="Message">
            <strong>${author}</strong> <time datetime="${date}"><code>${new Date(date).toLocaleString("en-GB")}</code></time>
            <p>${content}</p>
        </li>`
    );
    eleventyConfig.addFilter("getLinkText",
        /**@type {(link: string) => string} */(link) => {
            switch (new URL(link, "https://asoftglow.dev").hostname) {
                case "github.com": return "GitHub Repo";
                case "asoftglow.dev":
                case "localhost": return "Product";
                default: return "Link";
            }
        });
};