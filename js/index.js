const API_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 20;
const MAX_DEMO_PAGES = 3;
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

const pagesCache = new Map();

let currentPage = 0;
let totalPages = MAX_DEMO_PAGES;
let isLoading = false;

function showState(state, errorMessage) {
  const states = {
    loading: loadingState,
    error: errorState,
    empty: emptyState,
    grid: pokemonGrid,
  };

  Object.values(states).forEach((el) => el.classList.add("hidden"));
  paginationControls.classList.add("hidden");

  if (state === "error" && errorMessage) {
    errorState.querySelector("p").textContent = errorMessage;
  }

  if (state === "grid" || state === "error" || state === "empty") {
    paginationControls.classList.remove("hidden");
  }

  states[state]?.classList.remove("hidden");
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
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });

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

      await new Promise((resolve) => {
        window.setTimeout(resolve, 250 * (attempt + 1));
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw new Error("No se pudo completar la petición.");
}

function renderPokemonList(pokemonList) {
  pokemonGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  pokemonList.forEach((pokemon) => {
    const id = extractPokemonId(pokemon.url);
    const clone = pokemonCardTemplate.content.cloneNode(true);

    const button = clone.querySelector(".pokemon-card__button");
    const image = clone.querySelector(".pokemon-card__image");
    const idValue = clone.querySelector(".id-value");
    const name = clone.querySelector(".pokemon-card__name");

    button.dataset.pokemonId = id;
    image.src = getPokemonImageUrl(id);
    image.alt = pokemon.name;
    idValue.textContent = formatPokemonId(id);
    name.textContent = pokemon.name;

    fragment.appendChild(clone);
  });

  pokemonGrid.appendChild(fragment);
}

function handleLoadedPage(pokemonList, totalCount, page) {
  currentPage = page;

  const apiTotalPages = Math.ceil((totalCount ?? LIMIT) / LIMIT);
  totalPages = Math.min(apiTotalPages, MAX_DEMO_PAGES);

  if (pokemonList.length === 0) {
    showState("empty");
  } else {
    renderPokemonList(pokemonList);
    showState("grid");
  }

  isLoading = false;
  setPaginationState();
}

async function loadPokemonPage(page = 0) {
  isLoading = true;
  setPaginationState();
  showState("loading");

  try {
    if (pagesCache.has(page)) {
      const cached = pagesCache.get(page);
      handleLoadedPage(cached.results, cached.count, page);
      return;
    }

    const offset = page * LIMIT;
    const url = `${API_URL}?limit=${LIMIT}&offset=${offset}`;
    const data = await fetchWithRetry(url);

    const pokemonList = data.results ?? [];
    const totalCount = data.count ?? LIMIT * MAX_DEMO_PAGES;

    pagesCache.set(page, { results: pokemonList, count: totalCount });
    handleLoadedPage(pokemonList, totalCount, page);
  } catch (error) {
    console.error(error);
    isLoading = false;
    setPaginationState();
    showState("error", "Error al cargar los Pokémon. Intenta de nuevo.");
  }
}

pokemonGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".pokemon-card__button");
  if (!button) return;

  const { pokemonId } = button.dataset;
  if (!pokemonId) return;

  window.location.href = `detail.html?id=${pokemonId}`;
});

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
