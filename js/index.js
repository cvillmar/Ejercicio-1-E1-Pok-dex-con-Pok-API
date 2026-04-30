const API_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 18;
const MIN_PAGES = 3;
const REQUEST_TIMEOUT = 8000;
const RETRIES = 2;

const pokemonGrid = document.getElementById("pokemonGrid");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");
const pokemonCardTemplate = document.getElementById("pokemonCardTemplate");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageIndicator = document.getElementById("pageIndicator");
const retryBtn = document.getElementById("retryBtn");
const paginationControls = document.getElementById("paginationControls");

let currentPage = 0;
let totalPages = MIN_PAGES;
let isLoading = false;

function showLoading() {
  loadingState.classList.remove("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  pokemonGrid.classList.add("hidden");
}

function showError(message = "Error al cargar los datos. Intenta de nuevo.") {
  loadingState.classList.add("hidden");
  emptyState.classList.add("hidden");
  pokemonGrid.classList.add("hidden");
  errorState.classList.remove("hidden");
  errorState.querySelector("p").textContent = message;
  paginationControls.classList.remove("hidden");
}

function showEmpty() {
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  pokemonGrid.classList.add("hidden");
  emptyState.classList.remove("hidden");
  paginationControls.classList.remove("hidden");
}

function showGrid() {
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  pokemonGrid.classList.remove("hidden");
  paginationControls.classList.remove("hidden");
}

function setPaginationState() {
  pageIndicator.textContent = `Página ${currentPage + 1}`;
  prevBtn.disabled = currentPage === 0 || isLoading;
  nextBtn.disabled = currentPage + 1 >= totalPages || isLoading;
}

function extractPokemonId(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function formatPokemonId(id) {
  return id.toString().padStart(3, "0");
}

function getPokemonImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

async function fetchWithRetry(
  url,
  retries = RETRIES,
  timeout = REQUEST_TIMEOUT,
) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Error en la API: ${response.status} - ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }
  }

  throw new Error("No se pudo completar la petición.");
}

function renderPokemonList(pokemonList) {
  pokemonGrid.innerHTML = "";

  pokemonList.forEach((pokemon) => {
    const id = extractPokemonId(pokemon.url);
    const clone = pokemonCardTemplate.content.cloneNode(true);

    const button = clone.querySelector(".pokemon-card__button");
    const image = clone.querySelector(".pokemon-card__image");
    const idValue = clone.querySelector(".id-value");
    const name = clone.querySelector(".pokemon-card__name");

    button.dataset.pokemonId = id;
    button.addEventListener("click", () => {
      window.location.href = `detail.html?id=${id}`;
    });

    image.src = getPokemonImageUrl(id);
    image.alt = pokemon.name;
    idValue.textContent = formatPokemonId(id);
    name.textContent = pokemon.name;

    pokemonGrid.appendChild(clone);
  });
}

async function loadPokemonPage(page = 0) {
  isLoading = true;
  setPaginationState();
  showLoading();

  try {
    const offset = page * LIMIT;
    const url = `${API_URL}?limit=${LIMIT}&offset=${offset}`;
    const data = await fetchWithRetry(url);

    const pokemonList = data.results ?? [];
    const apiTotalPages = 3;

    currentPage = page;
    totalPages = Math.max(MIN_PAGES, apiTotalPages);

    if (pokemonList.length === 0) {
      showEmpty();
    } else {
      renderPokemonList(pokemonList);
      showGrid();
    }

    isLoading = false;
    setPaginationState();
  } catch (error) {
    console.error(error);
    isLoading = false;
    setPaginationState();
    showError("Error al cargar los Pokémon. Intenta de nuevo.");
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 0 && !isLoading) {
    loadPokemonPage(currentPage - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage + 1 < totalPages && !isLoading) {
    loadPokemonPage(currentPage + 1);
  }
});

retryBtn.addEventListener("click", () => {
  loadPokemonPage(currentPage);
});

loadPokemonPage(0);
