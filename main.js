const proxyURL = ["https://polyproxy.orangywastaken.workers.dev/v6/leaderboard?version=0.6.0-beta3&trackId=", "&skip=0&amount=200&onlyVerified=false"]
const trackIds = ["835e67c5949e2506ef87026801600a325c1c0f7367e10102640a1906c067735a", "51c7265ecfcb22d1144f6eb3fb0843e32afa2f86a2125dfd70453dc682ebc359", "d48294e4de5d8e606c0c29769cdb69cbbb02828022bc142a3e60570fa91defd5", "473408bd53696e4ee0e76b6f6101812ed967696c24fd08f740afabe946f2bce0", "e03503f8445fe7164ce7fe278cfc7f0c0fca4d21c11c701774f5fa1297a72805"]

const saveVariableToFile = function(data, filename = "data.json") {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

async function loadVariableFromGitHub(url) {
    const response = await fetch(`https://raw.githubusercontent.com/DoraChad/BBBB/refs/heads/main/${url}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const text = await response.text();
    return JSON.parse(text);
}

function popup(message) {
    const msg = document.createElement('div');
    msg.className = 'popup';
    msg.textContent = message;
    document.body.appendChild(msg);

    requestAnimationFrame(() => {
        msg.style.opacity = 1;
    });

    setTimeout(() => {
        msg.style.opacity = 0;
        msg.addEventListener('transitionend', () => msg.remove(), { once: true });
    }, 1000);
}

async function copyFileToClipboard(trackNum) {
    url = `https://raw.githubusercontent.com/DoraChad/BBBB/refs/heads/main/tracks/${trackNum}.track`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch file');

        const text = await res.text();
        await navigator.clipboard.writeText(text);

        popup("Track Code Copied To Clipboard");
    } catch (err) {
        console.error(err);
    }
}


async function fetchLeaderboard(trackNumber) {
    const url = `${proxyURL[0]}${trackIds[trackNumber]}${proxyURL[1]}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
}

async function getFullLeaderboards(totalTracks = 5) {
    return await loadVariableFromGitHub("data.json");
}

function calculatePoints(playerMap) {
    const playersWithPoints = [];

    for (const userId in playerMap) {
    const player = playerMap[userId];

    let points = 0;
    player.placements.forEach(place => {
        if (place === null) return;
        points += 100 / Math.sqrt(place);
    });

    playersWithPoints.push({
        userId,
        nickname: player.nickname,
        points
    });
    }

    playersWithPoints.sort((a, b) => b.points - a.points);

    return playersWithPoints;
}

const UI = document.createElement("div");
UI.className = "ui";
document.body.appendChild(UI)

const headDiv = document.createElement("div");
headDiv.className = "head-div";
UI.appendChild(headDiv)

const tracksDiv = document.createElement("div");
tracksDiv.className = "tracks-div";
UI.appendChild(tracksDiv);

const lbDiv = document.createElement("div");
lbDiv.className = "lb-div";
UI.appendChild(lbDiv);

const title = document.createElement("p")
title.textContent = "Bonnie Beans Birthday Bash";
title.style.fontSize = "60px";
title.style.margin = "40px";
headDiv.appendChild(title);

const lbTitle = document.createElement("p")
lbTitle.textContent = "Leaderboard";
lbTitle.style.fontSize = "40px";
lbTitle.style.margin = "20px";
lbDiv.appendChild(lbTitle);

const leaderboard = document.createElement("div");
leaderboard.className = "leaderboard";
lbDiv.appendChild(leaderboard);

for (let i = 1; i <= 5; i++) {
    const track = document.createElement("button");
    track.addEventListener("click", () => {
        copyFileToClipboard(i);
    })
    track.className = "track";
    track.style.backgroundImage = `url("https://raw.githubusercontent.com/DoraChad/BBBB/refs/heads/main/images/BBBB_Graphics_${i}a.jpg")`
    tracksDiv.appendChild(track);
}

(async () => {
    calculatePoints(await getFullLeaderboards()).forEach((player, placement) => {
        const entry = document.createElement("div");
        entry.className = "leaderboard-entry";

        const name = document.createElement("p");
        name.textContent = `${placement + 1}. ${player.nickname}`;
        name.style.fontSize = "25px";
        name.style.marginLeft = "10px";
        entry.appendChild(name);

        const points = document.createElement("p");
        points.textContent = Math.round(player.points*1000)/1000;
        points.style.fontSize = "25px";
        points.style.marginLeft = "auto";
        points.style.marginRight = "10px";
        entry.appendChild(points);

        leaderboard.appendChild(entry);
    });
})();
