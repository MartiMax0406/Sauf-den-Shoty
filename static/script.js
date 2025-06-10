window.onload = () => {
    const board = document.getElementById("svg-board");
    board.innerHTML = "";

    // Spieler-Infos aus Data-Attribut holen
    const spielerData = board.getAttribute("data-spieler");
    const spieler = spielerData ? JSON.parse(spielerData) : [];
    const aktueller = board.getAttribute("data-aktueller");

    // Snake-Board Parameter
    const FELDER = 31; // 0 (Start) bis 30
    const FELDER_PRO_REIHE = 8; // z.B. 8 Felder pro Zeile
    const REIHEN = Math.ceil(FELDER / FELDER_PRO_REIHE);
    const CIRCLE_RADIUS = 28;
    const ABSTAND_X = 80;
    const ABSTAND_Y = 90;
    const PADDING = 60;

    // SVG Größe berechnen
    const SVG_WIDTH = PADDING * 2 + ABSTAND_X * (FELDER_PRO_REIHE - 1);
    const SVG_HEIGHT = PADDING * 2 + ABSTAND_Y * (REIHEN - 1);

    // Snake-Positionen berechnen
    function getSnakePos(i) {
        const row = Math.floor(i / FELDER_PRO_REIHE);
        let col = i % FELDER_PRO_REIHE;
        // Jede zweite Reihe umdrehen (Schlangenlinie)
        if (row % 2 === 1) {
            col = FELDER_PRO_REIHE - 1 - col;
        }
        return {
            x: PADDING + col * ABSTAND_X,
            y: PADDING + row * ABSTAND_Y
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

    // Felder zeichnen
    for (let i = 0; i < FELDER; i++) {
        const {x, y} = getSnakePos(i);

        // Spieler auf diesem Feld
        const spielerHier = spieler.filter(s => s.position === i);

        // Kreis
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", CIRCLE_RADIUS);

        // Feldfarben und Markierungen
        if (i === 0) {
            // Startfeld
            circle.setAttribute("stroke", "#0077cc");
            circle.setAttribute("stroke-width", "5");
            circle.setAttribute("fill", "#e0f7fa");
        } else if (i === 30) {
            // Gewinnerfeld
            circle.setAttribute("stroke", "#FFD700");
            circle.setAttribute("stroke-width", "7");
            circle.setAttribute("fill", "url(#gold-gradient)");
        } else if (spielerHier.some(s => s.name === aktueller)) {
            // Aktueller Spieler
            circle.setAttribute("stroke", "#ff8800");
            circle.setAttribute("stroke-width", "6");
            circle.setAttribute("fill", "#ffe066");
        } else {
            // Normales Feld
            circle.setAttribute("stroke", "#ff8800");
            circle.setAttribute("stroke-width", "3");
            circle.setAttribute("fill", "#fff");
        }
        svg.appendChild(circle);

        // Gold-Gradient für Gewinnerfeld
        if (i === 30) {
            const defs = svg.querySelector("defs") || (() => {
                const d = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                svg.insertBefore(d, svg.firstChild);
                return d;
            })();
            if (!svg.querySelector("#gold-gradient")) {
                const grad = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
                grad.setAttribute("id", "gold-gradient");
                grad.innerHTML = `
                    <stop offset="0%" stop-color="#fffbe6"/>
                    <stop offset="60%" stop-color="#ffe066"/>
                    <stop offset="100%" stop-color="#FFD700"/>
                `;
                defs.appendChild(grad);
            }
        }

        // Feldnummer
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 6);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "18");
        text.setAttribute("font-family", "Arial, sans-serif");
        text.setAttribute("fill", i === 30 ? "#bfa14a" : "#bfa14a");
        text.setAttribute("font-weight", i === 30 ? "bold" : "normal");
        text.textContent = i === 0 ? "START" : (i === 30 ? "🏆 30" : i);
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
            nameText.setAttribute("fill", "#333");
            nameText.textContent = names;
            svg.appendChild(nameText);
        }
    }

    board.appendChild(svg);
};
