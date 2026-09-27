// @ts-check

/**@param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "passthrough": "." });
    eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

    eleventyConfig.setLiquidOptions({
        jsTruthy: true
    });
    eleventyConfig.addShortcode("year", () => new Date().getFullYear().toString());
    eleventyConfig.addPairedShortcode("convo",
        /**@type {(c: string, a: string, d: string) => string} */(content, guild_link, msg_link) => /*html*/`
        <div class="convo">
            <figure class="elevation">
                <ul>
                    ${content}
                </ul>
                <figcaption>
                    <a href="${guild_link}">Guild invite</a> •
                    <a href="${msg_link}">Msg link</a>
                </figcaption>
            </figure>
        </div>`
    );
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
