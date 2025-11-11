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
  // Inject a Figma-like detail layout into the detail container
  const container = document.getElementById("detail-container");
  if (!container) return;

  const html = `
  <div class="detail-card">
    <div class="detail-wrapper">
      <div class="detail-body">
        <div class="detail-panel">
          <img class="detail-image" src="${game.image || 'https://placehold.co/300x200'}" alt="${escapeHtml(
            game.title
          )}" />
          <div class="detail-content">
            <h2 class="detail-title">${escapeHtml(game.title)}</h2>
            <div class="detail-meta">${escapeHtml(game.genre || '')} · ${escapeHtml(
            game.language || ''
          )} · ${escapeHtml((game.players && game.players.min && game.players.max) ? `${game.players.min}-${game.players.max} spillere` : '')}</div>
            <div class="detail-description">${escapeHtml(game.description || '')}</div>
            <div class="detail-actions">
              <button class="btn-primary">Reserver</button>
              <button class="btn-secondary" id="detail-close">Tilbage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  container.innerHTML = html;
  showScreen('screen-detail');

  const closeBtn = document.getElementById('detail-close');
  if (closeBtn) closeBtn.addEventListener('click', () => showScreen('screen-home'));
}

// small helper to avoid HTML injection from game data
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  // Load games from the single app JSON file
  fetch("app.json/app.json")
    .then((res) => res.json())
    .then((data) => {
      games = data;
      renderHome();
      renderExplore();
    })
    .catch((err) => {
      console.error("Kunne ikke loade app.json", err);
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
