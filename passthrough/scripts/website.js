let accent = document.getElementById("accent-color");
const color = sessionStorage.getItem("color");
if (color) {
    document.documentElement.style.setProperty("--color-accent", color);
    accent.value = color;
}
else
    accent.value = /*parseRgb(*/window.getComputedStyle(document.body).backgroundColor;
accent.addEventListener("change", (event) => {
    document.documentElement.style.setProperty("--color-accent", event.target.value);
    sessionStorage.setItem("color", event.target.value);
}
);

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function parseRgb(string) {
    let a = string.slice(4);
    return rgbToHex(...a.slice(undefined, a.length - 1).split(", ").map(c => Number.parseInt(c)));
}