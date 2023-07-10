document.addEventListener('DOMContentLoaded', () => {
    if (Math.random() < 1/20) {
        let hair = document.getElementById("hair");
        hair.style.display = "initial";
        hair.style.top = `${getRand(10, 90)}%`;
        hair.style.left = `${getRand(10, 90)}%`;
        hair.style.rotate = `${getRand(0, 360)}deg`;
    }
})

function getRand(min, max) {
    return Math.random() * (max - min) + min;
}