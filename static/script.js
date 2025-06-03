window.onload = () => {
    const board = document.getElementById("game-board");
    board.innerHTML = "";

    // Spieler-Infos aus Data-Attribut holen
    const spielerData = board.getAttribute("data-spieler");
    const spieler = spielerData ? JSON.parse(spielerData) : [];
    const aktueller = board.getAttribute("data-aktueller");

    // Felder initialisieren
    for (let i = 0; i < 30; i++) {
        const cell = document.createElement("div");
        cell.classList.add("shoty-cell");

        // Spieler auf diesem Feld finden (position == i)
        const spielerHier = spieler.filter(s => s.position === i);
        let spielerText = "";
        if (spielerHier.length > 0) {
            spielerText = spielerHier.map(s => {
                if (s.name === aktueller) {
                    return `<span class="spieler-aktuell">${s.name}</span>`;
                } else {
                    return `<span class="spieler">${s.name}</span>`;
                }
            }).join(", ");
            // Feldnummer und Spielernamen nebeneinander
            cell.innerHTML = `<span class="feldnummer">${i + 1}:</span> ${spielerText}`;
        } else {
            cell.innerHTML = `<span class="feldnummer">${i + 1}</span>`;
        }

        // Feld hervorheben, wenn aktueller Spieler drauf steht
        if (spielerHier.some(s => s.name === aktueller)) {
            cell.classList.add("active-cell");
        }

        board.appendChild(cell);
    }
};
