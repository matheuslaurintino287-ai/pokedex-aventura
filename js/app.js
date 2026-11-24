const API = "https://pokeapi.co/api/v2";
const $ = (selector) => document.querySelector(selector);
const grid = $("#pokemon-grid");
const statusBox = $("#status-message");
const loading = $("#loading");
const searchInput = $("#search-input");
const searchButton = $("#search-button");
const typeSelect = $("#type-select");
const teamGrid = $("#team-grid");
const teamCount = $("#team-count");
const modal = new bootstrap.Modal($("#pokemon-modal"));
let team = JSON.parse(localStorage.getItem("pokedex-team") || "[]");

const typeNames = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];

function showStatus(message, kind = "info") {
  statusBox.className = `alert alert-${kind} mt-3`;
  statusBox.textContent = message;
}
function clearStatus() { statusBox.className = "alert d-none mt-3"; statusBox.textContent = ""; }
function setLoading(active) {
  loading.classList.toggle("d-none", !active);
  searchButton.disabled = active;
  typeSelect.disabled = active;
}
async function apiGet(path) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Não encontramos esse Pokémon ou recurso. Confira o nome ou número e tente novamente.");
    throw new Error(`A PokéAPI respondeu com erro HTTP ${response.status}. Tente novamente em instantes.`);
  }
  return response.json();
}
function safeName(value) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "");
}
function sprite(pokemon) {
  return pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default || "";
}
function titleCase(value) { return value.replaceAll("-", " "); }

function renderCard(pokemon) {
  const image = sprite(pokemon);
  const types = pokemon.types.map(item => `<span class="type-chip">${titleCase(item.type.name)}</span>`).join("");
  const col = document.createElement("div");
  col.className = "col-6 col-md-4 col-xl-3";
  col.innerHTML = `
    <article class="pokemon-card">
      <div class="pokemon-art">
        <span class="pokemon-number">#${String(pokemon.id).padStart(3,"0")}</span>
        ${image ? `<img src="${image}" alt="Imagem de ${pokemon.name}" loading="lazy">` : `<span class="muted">Imagem indisponível</span>`}
      </div>
      <div class="pokemon-info">
        <h3>${pokemon.name}</h3><div>${types}</div>
        <div class="card-actions">
          <button class="btn btn-primary flex-grow-1 details-btn" type="button">Detalhes</button>
          <button class="btn btn-outline-primary add-btn" type="button" aria-label="Adicionar ${pokemon.name} ao time">+ Time</button>
        </div>
      </div>
    </article>`;
  col.querySelector(".details-btn").addEventListener("click", () => showDetails(pokemon));
  col.querySelector(".add-btn").addEventListener("click", () => addToTeam(pokemon));
  return col;
}
function renderResults(items, heading) {
  grid.replaceChildren();
  $("#results-title").textContent = heading;
  $("#results-count").textContent = `${items.length} resultado(s)`;
  if (!items.length) {
    showStatus("Nenhum Pokémon encontrado para esta seleção.", "warning");
    return;
  }
  items.forEach(item => grid.appendChild(renderCard(item)));
  clearStatus();
}
async function searchPokemon() {
  const term = safeName(searchInput.value);
  if (!term) {
    showStatus("Digite o nome ou número de um Pokémon antes de pesquisar.", "warning");
    searchInput.focus();
    return;
  }
  if (!/^[a-z0-9-]+$/.test(term)) {
    showStatus("Entrada inválida. Use letras, números ou hífen.", "warning");
    return;
  }
  setLoading(true); clearStatus();
  try {
    const pokemon = await apiGet(`/pokemon/${encodeURIComponent(term)}`);
    renderResults([pokemon], "Resultado da pesquisa");
  } catch (error) {
    showStatus(error.message || "Não foi possível conectar à PokéAPI. Verifique sua internet e tente novamente.", "danger");
    grid.replaceChildren(); $("#results-count").textContent = "";
  } finally { setLoading(false); }
}
async function filterByType(type) {
  if (!type) { loadFeatured(); return; }
  setLoading(true); clearStatus();
  try {
    const data = await apiGet(`/type/${encodeURIComponent(type)}`);
    const members = data.pokemon.slice(0, 12);
    const results = await Promise.all(members.map(item => apiGet(`/pokemon/${item.pokemon.name}`)));
    renderResults(results, `Tipo: ${titleCase(type)}`);
  } catch (error) {
    showStatus(error.message || "Falha ao carregar Pokémon desse tipo. Tente novamente.", "danger");
  } finally { setLoading(false); }
}
async function loadFeatured() {
  setLoading(true); clearStatus();
  try {
    const ids = [1,4,7,25,39,52,94,133];
    const results = await Promise.all(ids.map(id => apiGet(`/pokemon/${id}`)));
    renderResults(results, "Pokémon em destaque");
  } catch (error) {
    showStatus("Não foi possível carregar os destaques. Verifique sua conexão e tente novamente.", "danger");
  } finally { setLoading(false); }
}

async function showDetails(pokemon) {
  const content = $("#modal-content");
  $("#modal-title").textContent = pokemon.name;
  content.innerHTML = '<div class="loading-state"><span class="spinner-border spinner-border-sm"></span> Carregando ficha completa...</div>';
  modal.show();
  try {
    const species = await apiGet(`/pokemon-species/${pokemon.id}`);
    const description = species.flavor_text_entries.find(entry => entry.language.name === "en")?.flavor_text
      ?.replace(/[\n\f]/g, " ") || "Descrição da espécie não disponível.";
    const stats = pokemon.stats.map(stat => `
      <div class="stat-row"><span>${titleCase(stat.stat.name)}</span>
      <div class="stat-track"><div class="stat-fill" style="width:${Math.min(stat.base_stat, 150)/150*100}%"></div></div>
      <strong>${stat.base_stat}</strong></div>`).join("");
    const abilities = pokemon.abilities.map(item => `<button class="ability-button" data-ability="${item.ability.name}" type="button">${titleCase(item.ability.name)} ⓘ</button>`).join("");
    content.innerHTML = `
      <div class="row g-4">
        <div class="col-12 col-md-5"><div class="detail-art"><img src="${sprite(pokemon)}" alt="Imagem de ${pokemon.name}"></div>
          <div class="text-center mt-3">${pokemon.types.map(t=>`<span class="type-chip">${titleCase(t.type.name)}</span>`).join("")}</div>
        </div>
        <div class="col-12 col-md-7">
          <p class="muted mb-1">Nº ${String(pokemon.id).padStart(3,"0")} · ${species.is_legendary ? "Lendário" : species.is_mythical ? "Mítico" : "Espécie Pokémon"}</p>
          <p>${description}</p>
          <div class="d-flex gap-4 mb-3"><span><strong>${(pokemon.height/10).toFixed(1)} m</strong><br><small class="muted">Altura</small></span><span><strong>${(pokemon.weight/10).toFixed(1)} kg</strong><br><small class="muted">Peso</small></span></div>
          <h3 class="h6 fw-bold">Habilidades <small class="muted fw-normal">(clique para consultar)</small></h3><div>${abilities}</div>
          <div id="ability-info" class="small muted mt-2" aria-live="polite"></div>
        </div>
      </div>
      <hr><h3 class="h6 fw-bold">Atributos base</h3>${stats}
      <button class="btn btn-primary rounded-pill mt-3" id="modal-add-team" type="button">Adicionar ao meu time</button>`;
    content.querySelectorAll("[data-ability]").forEach(button => button.addEventListener("click", () => showAbility(button.dataset.ability)));
    $("#modal-add-team").addEventListener("click", () => addToTeam(pokemon));
  } catch (error) {
    content.innerHTML = `<div class="alert alert-warning">Não foi possível carregar os dados da espécie. ${error.message}</div>`;
  }
}
async function showAbility(name) {
  const target = $("#ability-info");
  target.textContent = "Consultando habilidade...";
  try {
    const ability = await apiGet(`/ability/${encodeURIComponent(name)}`);
    const effect = ability.effect_entries.find(entry => entry.language.name === "en")?.short_effect || "Descrição não disponível.";
    target.textContent = `${titleCase(ability.name)}: ${effect}`;
  } catch (error) { target.textContent = error.message || "Não foi possível consultar essa habilidade."; }
}
function saveTeam() {
  localStorage.setItem("pokedex-team", JSON.stringify(team));
  renderTeam();
}
function addToTeam(pokemon) {
  if (team.some(item => item.id === pokemon.id)) { showStatus(`${pokemon.name} já está no seu time.`, "info"); return; }
  if (team.length >= 6) { showStatus("Seu time já tem 6 Pokémon. Remova um antes de adicionar outro.", "warning"); return; }
  team.push({id:pokemon.id,name:pokemon.name,image:sprite(pokemon)});
  saveTeam();
  showStatus(`${pokemon.name} foi adicionado ao seu time!`, "success");
}
function renderTeam() {
  teamCount.textContent = `${team.length}/6`;
  teamGrid.replaceChildren();
  if (!team.length) {
    const empty = document.createElement("div"); empty.className = "col-12";
    empty.innerHTML = '<div class="empty-team">Sua equipe ainda está vazia. Explore e adicione seus Pokémon favoritos!</div>';
    teamGrid.appendChild(empty); return;
  }
  team.forEach(item => {
    const col = document.createElement("div"); col.className = "col-12 col-sm-6 col-lg-4";
    col.innerHTML = `<div class="team-card"><img src="${item.image}" alt=""><div><strong>${item.name}</strong><div class="small muted">#${String(item.id).padStart(3,"0")}</div></div><button class="btn btn-sm btn-outline-danger rounded-pill" type="button">Remover</button></div>`;
    col.querySelector("button").addEventListener("click", () => { team = team.filter(p => p.id !== item.id); saveTeam(); });
    teamGrid.appendChild(col);
  });
}
function populateTypes() {
  typeNames.forEach(type => {
    const option = document.createElement("option"); option.value = type; option.textContent = titleCase(type);
    typeSelect.appendChild(option);
  });
}
searchButton.addEventListener("click", searchPokemon);
searchInput.addEventListener("keydown", event => { if (event.key === "Enter") searchPokemon(); });
typeSelect.addEventListener("change", event => filterByType(event.target.value));
$("#clear-team").addEventListener("click", () => { team = []; saveTeam(); });
populateTypes();
renderTeam();
loadFeatured();
