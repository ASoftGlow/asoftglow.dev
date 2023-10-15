import { addOption, removeChild } from './util.js';

const teams = 2;

const colors = [];
const selects = [];
var playerOptions = [];
var page = 2;
var edited = true;
const pages = ["loading-page", "display-page", "edit-page"].map(p => document.getElementById(p));
const roster = document.getElementById("roster");
const nav = document.getElementsByTagName("nav")[0];

for (let t = 0; t < teams; t++) {
    const cont = document.getElementById("team" + t);
    for (let i = 0; i < cont.children.length; i++) {
        const s = cont.children[i];
        if (s.nodeName !== "SELECT") continue;
        s.addEventListener("change", change);
        selects.push(s);
    }
}

for (let i = 0; i < nav.children.length; i++) {
    nav.children[i].addEventListener('click', e => {
        // switch page
        nav.children[page].disabled = false;
        e.target.disabled = true;

        showPage(i);
        switch (page) {
            case 1:
                display();
                break;
        }
    });
}

const dark = window.matchMedia("prefers-color-scheme: dark");
for (let t = 0; t < teams; t++) {
    const c = document.getElementById("team" + t).getElementsByTagName("input")[0];
    if (dark) c.value = "#ffffff";
    colors.push(c);
}

showPage(2);
reset();

document.getElementById("reset-btn").addEventListener('click', reset);

function showPage(newPage) {
    pages[page].style.display = "none";
    pages[newPage].style.display = "block";
    page = newPage;
}

function change(event) {
    const val = event.target.value;
    const old = event.target.name;
    event.target.name = val;

    if (old !== "") addPlayer(old, event.target);
    if (val !== "") removePlayer(val);
    edited = true;
}

function addPlayer(player, skip) {
    playerOptions.push(player);
    selects.forEach(i => {
        if (i.name !== player && i !== skip)
            addOption(i, player);
    });
    roster.append(player + "\n");
}

function removePlayer(player, skip = true) {
    playerOptions = playerOptions.filter(v => v !== player);
    selects.forEach(i => {
        if (!skip || i.name !== player)
            removeChild(i, player);
        if (!skip) {
            i.name = "";
        }
    });
    roster.textContent = roster.textContent.split("\n").filter(p => p !== player).join("\n");
}

function display() {
    for (let t = 0; t < teams; t++) {
        const output = document.getElementById("o-team" + t);
        output.style.color = colors[t].value;

        if (!edited) continue;
        const inputs = document.getElementById("team" + t).getElementsByTagName("select");
        const players = [];
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value)
                players.push(inputs[i].value);
        }
        output.textContent = players.join("\n");
    }
    if (edited) edited = false;
}

export function reset() {
    const playersStoreRaw = localStorage.getItem("players");
    const playersStore = playersStoreRaw ? playersStoreRaw.split("\n") : [];
    playerOptions = ["", ...playersStore];
    selects.forEach(i => i.textContent = '');
    roster.textContent = playersStore.join("\n");

    if (playersStore.length)
        selects.forEach(i => {
            i.name = "";
            playerOptions.forEach(p => addOption(i, p));
        });
}