document.addEventListener('DOMContentLoaded', () => {
    let accent = document.getElementById("accent-color");
    accent.value = parseRgb(window.getComputedStyle(document.body).backgroundColor);
    accent.addEventListener("change", (event) =>
        document.documentElement.style.setProperty("--color-accent", event.target.value)
    );
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function parseRgb(string) {
    let a = string.slice(4);
    return rgbToHex(...a.slice(undefined, a.length - 1).split(", ").map(c => Number.parseInt(c)));
}