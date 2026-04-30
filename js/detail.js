const API_URL = "https://pokeapi.co/api/v2/pokemon";
const REQUEST_TIMEOUT = 8000;
const RETRIES = 2;

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const pokemonDetail = document.getElementById("pokemonDetail");
const retryBtn = document.getElementById("retryBtn");
const backBtn = document.getElementById("backBtn");

function showState(state, errorMessage) {
  const states = {
    loading: loadingState,
    error: errorState,
    detail: pokemonDetail,
  };

  Object.values(states).forEach((el) => el?.classList.add("hidden"));

  if (state === "error" && errorMessage) {
    errorState.querySelector("p").textContent = errorMessage;
  }

  states[state]?.classList.remove("hidden");
}

function extractPokemonId(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function formatPokemonId(id) {
  return `#${id.toString().padStart(3, "0")}`;
}

function getPokemonImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
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

function renderDetail(pokemon) {
  const id = pokemon.id;

  document.getElementById("detailName").textContent = pokemon.name;
  document.getElementById("detailId").textContent = formatPokemonId(id);

  document.getElementById("detailImage").src = getPokemonImageUrl(id);
  document.getElementById("detailImage").alt = pokemon.name;

  const typesContainer = document.getElementById("detailTypes");
  typesContainer.innerHTML = "";
  pokemon.types.forEach((typeObj) => {
    const span = document.createElement("span");
    span.textContent = typeObj.type.name;
    typesContainer.appendChild(span);
  });

  document.getElementById("detailHeight").textContent =
    `${pokemon.height / 10} m`;
  document.getElementById("detailWeight").textContent =
    `${pokemon.weight / 10} kg`;
  document.getElementById("detailBaseExperience").textContent =
    pokemon.base_experience || "N/A";

  const stats = pokemon.stats;
  document.getElementById("detailHp").textContent = stats[0].base_stat;
  document.getElementById("detailAttack").textContent = stats[1].base_stat;
  document.getElementById("detailDefense").textContent = stats[2].base_stat;
  document.getElementById("detailSpAtk").textContent = stats[3].base_stat;
  document.getElementById("detailSpDef").textContent = stats[4].base_stat;
  document.getElementById("detailSpeed").textContent = stats[5].base_stat;

  const abilitiesList = document.getElementById("detailAbilities");
  abilitiesList.innerHTML = "";
  pokemon.abilities.forEach((abilityObj) => {
    const li = document.createElement("li");
    li.textContent = abilityObj.ability.name;
    if (abilityObj.is_hidden) {
      li.textContent += " (oculta)";
    }
    abilitiesList.appendChild(li);
  });

  showState("detail");
}

async function loadPokemonDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonId = urlParams.get("id");

  if (!pokemonId) {
    showState("error", "ID de Pokémon no especificado.");
    return;
  }

  showState("loading");

  try {
    const url = `${API_URL}/${pokemonId.toLowerCase()}`;
    const data = await fetchWithRetry(url);
    renderDetail(data);
  } catch (error) {
    console.error(error);
    showState(
      "error",
      "Error al cargar los detalles del Pokémon. Intenta de nuevo.",
    );
  }
}

backBtn.addEventListener("click", () => {
  window.history.back();
});

retryBtn.addEventListener("click", () => {
  loadPokemonDetail();
});

loadPokemonDetail();
