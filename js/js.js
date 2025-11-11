// JavaScript code for Spilcaféen app
// Add your JavaScript here
// app.js

let games = [];

/* --------- Navigation mellem skærme --------- */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.toggle("active", s.id === id);
  });

  document.querySelectorAll(".bottom-nav .nav-btn").forEach((btn) => {
    const target = btn.dataset.target;
    btn.classList.toggle("active", target === id);
  });
}

/* --------- Hjælp: spilkort (kort-komponent) --------- */

function createGameCard(game) {
  const card = document.createElement("article");
  card.className = "game-card";

  const img = document.createElement("img");
  img.className = "game-image";
  img.src =
    game.image ||
    "https://via.placeholder.com/300x180?text=" + encodeURIComponent(game.title);
  img.alt = game.title;

  const header = document.createElement("div");
  header.className = "game-header";

  const title = document.createElement("div");
  title.className = "game-title";
  title.textContent = game.title;

  const heart = document.createElement("button");
  heart.className = "game-heart";
  heart.type = "button";
  heart.innerHTML = "♡";
  heart.addEventListener("click", () => {
    heart.innerHTML = heart.innerHTML === "♡" ? "❤" : "♡";
  });

  header.appendChild(title);
  header.appendChild(heart);

  const meta = document.createElement("div");
  meta.className = "game-meta";

  const playtimeText = game.playtime ? `${game.playtime} min` : "? min";
  const playersText =
    game.players && game.players.min && game.players.max
      ? `${game.players.min}-${game.players.max} spillere`
      : "Ukendt antal spillere";
  const ageText = game.age ? `${game.age}+ år` : "Ukendt alder";

  meta.textContent = `${playtimeText} · ${playersText} · ${ageText}`;

  const btn = document.createElement("button");
  btn.className = "btn-small";
  btn.type = "button";
  btn.textContent = "Detaljer";
  btn.addEventListener("click", () => openGameDetails(game));

  card.appendChild(img);
  card.appendChild(header);
  card.appendChild(meta);
  card.appendChild(btn);

  return card;
}

/* --------- Simpel detalje-visning (kan udskiftes med modal senere) --------- */

function openGameDetails(game) {
  const tekst = [
    game.title,
    "",
    game.description || "",
    "",
    `Genre: ${game.genre}`,
    `Sprog: ${game.language}`,
    `Spilletid: ${game.playtime} min`,
    `Spillere: ${game.players.min}-${game.players.max}`,
    `Alder: ${game.age}+`,
    `Sværhedsgrad: ${game.difficulty}`,
    `Lokation: ${game.location}, hylde ${game.shelf}`,
    "",
    "Kort beskrivelse af regler:",
    game.rules || "",
  ].join("\n");
  alert(tekst);
}

/* --------- Sektioner (logik for "nye", "månedens", osv.) --------- */

/*
  Du har ikke felter for "nye/månedens/glemte/populære" i JSON.
  Her laver vi bare en fornuftig AUTO-logik:

  - Nye spil  = de med højest id (sidst tilføjet)
  - Månedens  = de med højest rating
  - Glemte    = disponible spil med rating <= 4.0
  - Populære  = høj rating + tilgængelige
*/

function getNewGames() {
  return [...games].sort((a, b) => b.id - a.id).slice(0, 5);
}

function getMonthlyGames() {
  return [...games].sort((a, b) => b.rating - a.rating).slice(0, 5);
}

function getForgottenGames() {
  return [...games]
    .filter((g) => g.available && g.rating <= 4.0)
    .slice(0, 8);
}

function getPopularGames() {
  return [...games]
    .filter((g) => g.available)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
}

/* --------- Rendering af de to sider --------- */

function renderHome() {
  const container = document.getElementById("home-monthly");
  if (!container) return;
  container.innerHTML = "";

  getMonthlyGames().forEach((game) =>
    container.appendChild(createGameCard(game))
  );
}

function renderExplore() {
  const sections = {
    "games-new": getNewGames(),
    "games-month": getMonthlyGames(),
    "games-forgotten": getForgottenGames(),
    "games-popular": getPopularGames(),
  };

  Object.entries(sections).forEach(([id, list]) => {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = "";
    list.forEach((game) => container.appendChild(createGameCard(game)));
  });
}

/* --------- Hent JSON-fil --------- */

function loadGames() {
  fetch("games.json")
    .then((res) => res.json())
    .then((data) => {
      games = data;
      renderHome();
      renderExplore();
    })
    .catch((err) => {
      console.error("Kunne ikke loade games.json", err);
    });
}

/* --------- Init --------- */

document.addEventListener("DOMContentLoaded", () => {
  // Splash -> home efter 2 sek.
  setTimeout(() => {
    showScreen("screen-home");
  }, 2000);

  // Navigation (bund + back-knap)
  document.querySelectorAll("[data-target]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.target;
      if (target) showScreen(target);
    });
  });

  loadGames();
});
