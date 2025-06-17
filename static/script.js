window.onload = () => {
    const board = document.getElementById("svg-board");
    board.innerHTML = "";

    // Spieler-Infos aus Data-Attribut holen
    const spielerData = board.getAttribute("data-spieler");
    const spieler = spielerData ? JSON.parse(spielerData) : [];
    const aktueller = board.getAttribute("data-aktueller");

    // Loch-Felder aus Backend holen (über counter = Positionen, aber wir brauchen die Loch-Info)
    // Wir holen die Loch-Info aus einem neuen Data-Attribut, das die Felder als Array enthält
    // (siehe Änderung unten in spiel.html)
    let felder = [];
    try {
        felder = JSON.parse(board.getAttribute("data-felder"));
    } catch (e) {
        // fallback: alle Felder keine Löcher
        felder = Array(31).fill(0);
    }

    // Snake-Board Parameter
    const FELDER = 31; // 0 (Start) bis 30
    const FELDER_PRO_REIHE = 8;
    const REIHEN = Math.ceil(FELDER / FELDER_PRO_REIHE);
    const CIRCLE_RADIUS = 28;
    const ABSTAND_X = 100;
    const ABSTAND_Y = 120;
    const PADDING_X = 80;
    const PADDING_Y = 80;

    // SVG Größe berechnen
    const SVG_WIDTH = PADDING_X * 2 + ABSTAND_X * (FELDER_PRO_REIHE - 1);
    const SVG_HEIGHT = PADDING_Y * 2 + ABSTAND_Y * (REIHEN - 1);

    // Motive für die Felder (ohne Kappe, mit Alkohol)
    const MOTIVE = ["🥕", "🌾", "🥬", "🌼", "🍺", "🍻", "🍹", "🍷"];
    // 🐰 = Start, 🏆 = Ziel, 💣 = Loch

    // Symmetrische Snake-Positionen berechnen (wirklich symmetrisch, auch letzte Zeile!)
    function getSnakePos(i) {
        const row = Math.floor(i / FELDER_PRO_REIHE);
        let felderInReihe = FELDER_PRO_REIHE;
        if (row === REIHEN - 1 && FELDER % FELDER_PRO_REIHE !== 0) {
            felderInReihe = FELDER % FELDER_PRO_REIHE;
        }
        let idxInRow = i - row * FELDER_PRO_REIHE;
        let col = row % 2 === 0 ? idxInRow : (felderInReihe - 1 - idxInRow);
        const zeilenBreite = ABSTAND_X * (felderInReihe - 1);
        const startX = (SVG_WIDTH - zeilenBreite) / 2;
        return {
            x: startX + col * ABSTAND_X,
            y: PADDING_Y + row * ABSTAND_Y
        };
    }

    // SVG erzeugen
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", SVG_WIDTH);
    svg.setAttribute("height", SVG_HEIGHT);
    svg.style.background = "#fffbe6";
    svg.style.borderRadius = "30px";
    svg.style.boxShadow = "0 4px 24px rgba(255,136,0,0.10)";
    svg.style.margin = "30px auto";
    svg.style.display = "block";

    // Zeilen-Hintergrund für bessere Erkennbarkeit (Abtrennungen immer gleich groß)
    for (let row = 0; row < REIHEN; row++) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", 0);
        rect.setAttribute("y", PADDING_Y + row * ABSTAND_Y - ABSTAND_Y / 2 + CIRCLE_RADIUS);
        rect.setAttribute("width", SVG_WIDTH);
        rect.setAttribute("height", ABSTAND_Y);
        rect.setAttribute("fill", row % 2 === 0 ? "#fffbe6" : "#ffeccc");
        rect.setAttribute("opacity", "0.5");
        svg.appendChild(rect);
    }

    // Schatten-Filter für Kreise und Gold-Gradient
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#ff8800" flood-opacity="0.25"/>
        </filter>
        <radialGradient id="gold-gradient">
            <stop offset="0%" stop-color="#fffbe6"/>
            <stop offset="60%" stop-color="#ffe066"/>
            <stop offset="100%" stop-color="#FFD700"/>
        </radialGradient>
    `;
    svg.appendChild(defs);

    // Bögen an den Zeilenenden zeichnen
    for (let row = 0; row < REIHEN - 1; row++) {
        let felderInReihe = FELDER_PRO_REIHE;
        let felderInNext = FELDER_PRO_REIHE;
        if (row === REIHEN - 2 && FELDER % FELDER_PRO_REIHE !== 0) {
            felderInNext = FELDER % FELDER_PRO_REIHE;
        }
        let lastIdx = (row + 1) * FELDER_PRO_REIHE - 1;
        if (lastIdx >= FELDER) lastIdx = FELDER - 1;
        let nextIdx = (row + 1) * FELDER_PRO_REIHE;
        if (nextIdx >= FELDER) continue;

        const p1 = getSnakePos(lastIdx);
        const p2 = getSnakePos(nextIdx);

        const sweep = (row % 2 === 0) ? 1 : 0;
        const arcRadius = ABSTAND_X / 1.5;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d",
            `M${p1.x},${p1.y} A${arcRadius},${arcRadius} 0 0,${sweep} ${p2.x},${p2.y}`
        );
        path.setAttribute("stroke", "#ff8800");
        path.setAttribute("stroke-width", "5");
        path.setAttribute("fill", "none");
        path.setAttribute("opacity", "0.7");
        svg.appendChild(path);
    }

    // Felder zeichnen
    for (let i = 0; i < FELDER; i++) {
        const {x, y} = getSnakePos(i);
        const spielerHier = spieler.filter(s => s.position === i);

        // Loch-Feld?
        const istLoch = felder[i] === 1;

        // Kreis
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", CIRCLE_RADIUS);
        circle.setAttribute("filter", "url(#shadow)");

        // Feldfarben und Markierungen
        if (i === 0) {
            circle.setAttribute("stroke", "#0077cc");
            circle.setAttribute("stroke-width", "5");
            circle.setAttribute("fill", "#e0f7fa");
        } else if (i === 30) {
            circle.setAttribute("stroke", "#FFD700");
            circle.setAttribute("stroke-width", "7");
            circle.setAttribute("fill", "url(#gold-gradient)");
        } else if (istLoch) {
            circle.setAttribute("stroke", "#222");
            circle.setAttribute("stroke-width", "5");
            circle.setAttribute("fill", "#222");
        } else if (spielerHier.some(s => s.name === aktueller)) {
            circle.setAttribute("stroke", "#ff8800");
            circle.setAttribute("stroke-width", "6");
            circle.setAttribute("fill", "#ffe066");
        } else {
            circle.setAttribute("stroke", "#ff8800");
            circle.setAttribute("stroke-width", "3");
            circle.setAttribute("fill", "#fff");
        }
        svg.appendChild(circle);

        // Motiv-Emoji
        let emoji = "";
        if (i === 0) emoji = "🐰";
        else if (i === 30) emoji = "🏆";
        else if (istLoch) emoji = "💣";
        else emoji = MOTIVE[(i + 1) % MOTIVE.length];

        const emojiText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        emojiText.setAttribute("x", x);
        emojiText.setAttribute("y", y + 8);
        emojiText.setAttribute("text-anchor", "middle");
        emojiText.setAttribute("font-size", istLoch ? "28" : "32");
        emojiText.setAttribute("font-family", "Segoe UI Emoji, Arial, sans-serif");
        emojiText.textContent = emoji;
        svg.appendChild(emojiText);

        // Feldnummer (klein, unter das Emoji)
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + CIRCLE_RADIUS - 8);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "13");
        text.setAttribute("font-family", "Arial, sans-serif");
        text.setAttribute("fill", "#bfa14a");
        text.textContent = i === 0 ? "START" : (i === 30 ? "ZIEL" : i);
        svg.appendChild(text);

        // Spielernamen
        if (spielerHier.length > 0) {
            const names = spielerHier.map(s =>
                s.name === aktueller
                    ? `🟠${s.name}`
                    : `🟢${s.name}`
            ).join(", ");
            const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            nameText.setAttribute("x", x);
            nameText.setAttribute("y", y + CIRCLE_RADIUS + 18);
            nameText.setAttribute("text-anchor", "middle");
            nameText.setAttribute("font-size", "15");
            nameText.setAttribute("font-family", "Arial, sans-serif");
            nameText.setAttribute("fill", "#fff");
            nameText.textContent = names;
            svg.appendChild(nameText);
        }
    }

    board.appendChild(svg);
};
