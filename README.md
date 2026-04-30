# Ejercicio 1 (E1): Pokedex con PokeAPI

## Objetivo
Construir una mini Pokedex consumiendo datos reales de PokeAPI, con:

- listado paginado,
- control de estados de UI,
- y pagina de detalle por Pokemon.

## API usada

- Listado: `GET https://pokeapi.co/api/v2/pokemon?limit={limit}&offset={offset}`
- Detalle: `GET https://pokeapi.co/api/v2/pokemon/{id}`

## Requisitos del ejercicio

1. Consumir datos reales desde PokeAPI.
2. Implementar estados: `loading`, `error` con `reintento`, `vacio`, `datos`.
3. Paginacion con minimo 3 paginas.
4. Cada item del listado debe mostrar: imagen, nombre e id/indice visible.
5. Debe existir pagina de detalle.
6. En detalle mostrar al menos: nombre, id, sprite, tipos, altura y peso.
7. Manejo de error controlado en detalle (sin romper la app).

## Criterios implementados en este proyecto

- [x] Consumo de PokeAPI con `fetch` y datos reales.
- [x] Estados en listado (`loading`, `error`, `vacio`, `datos`).
- [x] Boton de reintento en errores.
- [x] Paginacion funcional (actualmente limitada a los primeros 151 Pokemon).
- [x] Minimo de 3 paginas (la implementacion actual tiene 8 paginas con `limit=20`).
- [x] Item de listado con imagen, nombre e id visible.
- [x] Navegacion a detalle por query param `?id=`.
- [x] Detalle con nombre, id, sprite, tipos, altura y peso.
- [x] Error controlado en detalle con mensaje y reintento.

## Decisiones tecnicas

- Se limita el listado a `MAX_POKEMON = 151`.
- `LIMIT = 20` por pagina.
- La ultima pagina muestra solo los elementos restantes (hasta 151).
- Reintentos y timeout en peticiones de red:
	- `RETRIES = 2`
	- `REQUEST_TIMEOUT = 8000`

## Estructura del proyecto

```text
.
|- index.html
|- detail.html
|- css/
|  |- index.css
|  |- detail.css
|- js/
|  |- index.js
|  |- detail.js
|  |- theme.js
|- assets/
```

## Como ejecutar

Abrir el proyecto en un servidor local (por ejemplo, Live Server en VS Code) y navegar a:

- `index.html` para el listado.
- `detail.html?id=1` para una prueba directa de detalle.

## Demo sugerida (2-3 min)

1. Cargar listado: mostrar transicion `loading -> datos`.
2. Navegar varias paginas.
3. Verificar que la ultima pagina no supera el Pokemon 151.
4. Abrir detalle desde una card.
5. Simular error de red y probar boton `Reintentar`.
