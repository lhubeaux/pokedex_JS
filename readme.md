# Pokédex JS

A simple Pokédex that fetches and displays Pokémon from the [PokéAPI](https://pokeapi.co/).

---

## How it works

### index.html
The structure of the page. Three main sections:
- `.header` — title area
- `.btns` — contains the two pagination buttons (`#previous` and `#next`)
- `.poke_list` — the empty grid that JavaScript fills with cards

The `<script>` tag uses `defer`, which means the JS file loads after the HTML is fully parsed — this is why the JS can safely find the buttons and `.poke_list` by the time it runs.

---

### style.css
- `.poke_list` uses CSS Grid with 5 columns (`repeat(5, 1fr)`) to lay out the cards
- `.poke-card` uses Flexbox to stack the name above the image and center everything
- `object-fit: contain` on `.poke-pic` keeps the sprite proportions without cropping

---

### script.js

#### Global variables
```js
let currentUrl   // the URL of the page currently displayed
let nextUrl      // the next page URL returned by the API (null if none)
let previousUrl  // the previous page URL returned by the API (null if none)
```
These are declared at the top so all functions can read and update them. Using `let` (not `const`) is important because they need to be reassigned on each navigation.

#### fetchPokemonList(currentUrl)
Fetches a list of 20 Pokémon from the given URL. The API response looks like:
```json
{
  "next": "https://pokeapi.co/api/v2/pokemon/?limit=20&offset=20",
  "previous": null,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" }
  ]
}
```
`next` and `previous` are full ready-to-use URLs for pagination, or `null` at the edges of the list.

#### fetchPokemonDetails(url)
Fetches the full data for a single Pokémon (sprites, stats, types, etc.) using the URL found in `results`.

#### createPokemonCard(name, details)
Builds a card DOM element from scratch using `document.createElement`. Appends a name (`<h3>`) and an image (`<img>`). The image prefers the high-quality `dream_world` sprite and falls back to the basic `front_default` sprite if it doesn't exist.

#### renderPokedex()
The main function. It:
1. Fetches the current page using `currentUrl`
2. Saves `data.next` and `data.previous` into the global variables
3. Clears the grid
4. Loops through the 20 results, fetches each Pokémon's details, creates a card, and appends it

#### Button listeners
```js
previousBtn → sets currentUrl = previousUrl → calls renderPokedex()
nextBtn     → sets currentUrl = nextUrl     → calls renderPokedex()
```
Updating `currentUrl` before calling `renderPokedex()` is key — that's what makes the next render fetch the right page.

---

## Key concepts to remember

- **Variable shadowing**: using `let` inside a function creates a *new local* variable — it does NOT update the global one. Always assign to globals without `let`/`const`.
- **Template literals are evaluated once**: building a URL with `` `...${variable}` `` at the top level freezes it at startup. Build URLs inside functions so they're fresh each time.
- **The API does the pagination math**: no need to track an offset manually — just use `data.next` and `data.previous`.
