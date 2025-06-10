window.onload = () => {
    const board = document.getElementById("svg-board");
    board.innerHTML = "";

    // Spieler-Infos aus Data-Attribut holen
    const spielerData = board.getAttribute("data-spieler");
    const spieler = spielerData ? JSON.parse(spielerData) : [];
    const aktueller = board.getAttribute("data-aktueller");

    // SVG-Parameter
    const FELDER = 31; // 0 (Start) bis 30
    const SVG_SIZE = 600;
    const CENTER = SVG_SIZE / 2;
    const R_START = 220;
    const R_END = 80;
    const CIRCLE_RADIUS = 32;

    // Spiral-Positionen berechnen
    function getSpiralPos(i) {
        // Spirale von außen nach innen
        const t = i / (FELDER - 1);
        const r = R_START - t * (R_START - R_END);
        const angle = 2 * Math.PI * 1.2 * t - Math.PI / 2; // 1.2 Umdrehungen
        return {
            x: CENTER + r * Math.cos(angle),
            y: CENTER + r * Math.sin(angle)
        };
    }

    // SVG erzeugen
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", SVG_SIZE);
    svg.setAttribute("height", SVG_SIZE);
    svg.style.background = "#fffbe6";
    svg.style.borderRadius = "30px";
    svg.style.boxShadow = "0 4px 24px rgba(255,136,0,0.10)";
    svg.style.margin = "30px auto";
    svg.style.display = "block";

    // Felder zeichnen
    for (let i = 0; i < FELDER; i++) {
        const {x, y} = getSpiralPos(i);

        // Spieler auf diesem Feld
        const spielerHier = spieler.filter(s => s.position === i);

        // Kreis
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", CIRCLE_RADIUS);
        circle.setAttribute("stroke", i === 0 ? "#0077cc" : "#ff8800");
        circle.setAttribute("stroke-width", i === 0 ? "5" : (spielerHier.some(s => s.name === aktueller) ? "6" : "3"));
        circle.setAttribute("fill", 
            i === 0 ? "#e0f7fa" : 
            (spielerHier.some(s => s.name === aktueller) ? "#ffe066" : "#fff")
        );
        svg.appendChild(circle);

        // Feldnummer
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 6);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "20");
        text.setAttribute("font-family", "Arial, sans-serif");
        text.setAttribute("fill", "#bfa14a");
        text.textContent = i === 0 ? "START" : i;
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
