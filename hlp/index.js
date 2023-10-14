const selectNames = ["goalie", "lw", "c", "rw", "ld", "rd", "missing"];
const forwardNames = ["lw", "rw", "c"];
const defenseNames = ["ld", "rd"];

const selects = [];
var playerOptions = [];
var page = 0;
var edited = true;
const pages = ["edit-page", "display-page"].map(p => document.getElementById(p));
const roster = document.getElementById("roster");
const nav = document.getElementsByTagName("nav")[0];

selectNames.forEach(name => {
    const cont = document.getElementById(name);
    let o = 0;
    for (let i = 0; i < cont.children.length; i++) {
        const s = cont.children[i];
        if (s.nodeName !== "SELECT" && --o) continue;
        s.setAttribute("data-i", i + o);
        selects.push(s);
    }
});

for (let i = 0; i < nav.children.length; i++) {
    const b = nav.children[i];
    b.setAttribute("data-i", i);
    b.addEventListener('click', e => {
        // switch page
        nav.children[page].disabled = false;
        e.target.disabled = true;

        showPage(Number.parseInt(e.target.dataset.i));
        switch (page) {
            case 1:
                display();
                break;
        }
    });
}

showPage(0);
loadData();

function showPage(newPage) {
    pages[page].style.display = "none";
    pages[newPage].style.display = "block";
    page = newPage;
}

function getSelectId(s) {
    return s.parentElement.id + s.dataset.i;
}

function change(event) {
    const val = event.target.value;
    const old = event.target.name;
    event.target.name = val;

    if (old !== "") addPlayer(old, event.target);
    if (val !== "") removePlayer(val);
    localStorage.setItem(getSelectId(event.target), val);
    edited = true;
}

function addPlayerClick() {
    let player = prompt("Enter player to add:");
    if (player && (player = player.trim())) {
        const players = localStorage.getItem("players");
        if (players) {
            localStorage.setItem("players", players + "\n" + player);
            addPlayer(player);
        }
        else {
            localStorage.setItem("players", player);
            reset();
        }
    }
}

function removePlayerClick() {
    let player = prompt("Enter player to remove:");
    if (player && (player = player.trim())) {
        let players = localStorage.getItem("players");
        if (players) {
            const newPlayers = players.split("\n").filter(p => p !== player);
            if (newPlayers.length) {
                localStorage.setItem("players", newPlayers.join("\n"));
            }
            else {
                localStorage.removeItem("players");
            }
        }
        removePlayer(player, false);
    }
}

function removeAll() {
    localStorage.removeItem("players");
    reset();
    clearPos();
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
            localStorage.removeItem(getSelectId(i));
        }
    });
    roster.textContent = roster.textContent.split("\n").filter(p => p !== player).join("\n");
}

function removeChild(parent, value) {
    const e = findChild(parent, value);
    if (e)
        parent.removeChild(e);
}

function addOption(parent, value) {
    const elm = document.createElement("option");
    elm.text = value;
    parent.appendChild(elm);
}

function findChild(parent, value) {
    for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i].text === value)
            return parent.children[i];
    }
}

function display() {
    if (!edited) return;
    edited = false;
    const forwardOutputs = Array.from(document.querySelectorAll("#o-forwards span"));
    forwardNames.forEach((p, i) => {
        const txt = Array.from(document.querySelectorAll(`#${p} select`)).map(s => s.value).filter(v => v !== '').join("\n");
        forwardOutputs[i].textContent = txt;
    });

    const defenseOutputs = Array.from(document.querySelectorAll("#o-defense span"));
    defenseNames.forEach((p, i) => {
        const txt = Array.from(document.querySelectorAll(`#${p} select`)).map(s => s.value).filter(v => v !== '').join("\n");
        defenseOutputs[i].textContent = txt;
    });

    const goalieOutput = document.querySelector("#o-goalie span");
    const txt = document.querySelector(`#goalie select`).value;
    goalieOutput.textContent = txt;
}

function importPlayersFile(files) {
    if (files[0].size > 1_000) {
        console.log("File too large");
        return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
        var file = fileLoadedEvent.target.result;
        if (!file) return;
        const playersTxt = file.replaceAll("\r", "");
        const players = playersTxt.split("\n").map(p => p.trim());
        importPlayers(players);
    };

    fileReader.readAsText(files[0], "UTF-8");
}

function importPlayers(players) {
    localStorage.setItem("players", players.join("\n"));

    reset();
    clearPos();
}

function loadData() {
    reset();

    selects.forEach(s => {
        const player = localStorage.getItem(getSelectId(s));
        if (player === null) return;
        s.value = player;
        s.name = player;
        removePlayer(player);
    });
}

function reset() {
    const playersStoreRaw = localStorage.getItem("players");
    const playersStore = playersStoreRaw ? playersStoreRaw.split("\n") : [];
    playerOptions = ["", ...playersStore];
    selects.forEach(i => i.textContent = '');
    roster.textContent = '';

    if (!playersStore.length) return;

    playersStore.forEach(p => {
        roster.append(p + "\n");
    });

    selects.forEach(i => {
        i.addEventListener("change", change);
        i.name = "";
        playerOptions.forEach(p => addOption(i, p));
    });
}

function clearPos() {
    selects.forEach(s => localStorage.removeItem(getSelectId(s)));
}