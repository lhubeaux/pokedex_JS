# Pokédex JS

A simple Pokédex that fetches and displays Pokémon from the [PokéAPI](https://pokeapi.co/).

Features:
- Paginated grid of Pokémon (20 per page) with Previous / Next buttons
- Click a card to open a **detail popup** (name, sprite, height, weight, types)
- **Search** a single Pokémon by name or ID
- Click the **header** to return home (first page)

---

## How it works

### index.html
The structure of the page. Main sections:
- `.header` — title area (also a clickable "home" button)
- `.btns` — contains the two pagination buttons (`#previous`, `#next`) and the search input (`#searchPoke`)
- `.poke_list` — the empty grid that JavaScript fills with cards

The `<script>` tag uses `defer`, which means the JS file loads after the HTML is fully parsed — this is why the JS can safely find the buttons, the input, and `.poke_list` by the time it runs.

The detail **popup is NOT in the HTML** — it's built entirely in JavaScript and appended to `<body>` at startup (see *The detail popup* below).

---

### style.css
- `.poke_list` uses CSS Grid with 5 columns (`repeat(5, 1fr)`) to lay out the cards
- `.poke-card` uses Flexbox to stack the name above the image and center everything
- `object-fit: contain` on `.poke-pic` keeps the sprite proportions without cropping

#### Popup styling
- `.popup` → `display: none;` — hidden by default
- `.popup.open` → `display: flex;` + `position: fixed; inset: 0;` — a full-screen overlay that dims the page and centers the box. The `.popup.open` selector means "an element that has **both** the `popup` and `open` classes." Because it lists two classes it is *more specific* than `.popup`, so it reliably overrides the hidden default no matter the rule order.
- `.details-box` → the white card's appearance (background, padding, rounded corners). It is **never** hidden itself — hiding its parent `.popup` hides it too.
- `.detail-img` → **must** have a fixed size (e.g. `200px` + `object-fit: contain`). The `dream_world` sprites are SVGs with a huge natural size; without a size cap the image makes the box taller than the screen and pushes the close button off-view.
- `.header` → `cursor: pointer;` to show it's clickable.

---

### script.js

#### Global variables
```js
const HOME_URL   // the first-page URL, stored once so it isn't duplicated
let currentUrl   // the URL of the page currently displayed
let nextUrl      // the next page URL returned by the API (null if none)
let previousUrl  // the previous page URL returned by the API (null if none)
```
`HOME_URL` is a `const` because it never changes. `currentUrl`/`nextUrl`/`previousUrl` use `let` because they're reassigned on each navigation.

#### elMaker(type, className, text) — DOM helper
A small helper that creates an element, optionally adds a class, optionally sets its text, and returns it:
```js
function elMaker(type, className, text){
    const el = document.createElement(type);
    if (className){ el.classList.add(className) };
    if (text !== undefined){ el.textContent = text };
    return el;
}
```
Two things to remember:
- `classList.add` takes the **bare class name** — no dot. `"popup"`, not `".popup"`. (The dot is CSS-selector syntax, used in `querySelector` / the `.css` file, not here.)
- `textContent` is preferred over `innerText` for setting plain text — it's simpler and faster.

#### The detail popup (built once, at startup)
The popup's fixed structure ("shell") is created a single time and left hidden in the page:
```
popupWindow (.popup)         ← full-screen overlay, toggled with the "open" class
  └─ detailBox (.details-box)   ← the visible white card
       ├─ closeBtn (.close-btn) ← the × (removes "open" on click)
       └─ insideContent         ← EMPTY div, refilled on every click
```
Only `insideContent` changes per Pokémon. The close button's listener is attached **once** here, because the button is never recreated.

#### showDetails(details)
Fills the popup and opens it:
1. Builds elements from the `details` object (name, image, height, weight, types) using `elMaker`.
2. `insideContent.replaceChildren(...)` — clears the old content **and** inserts the new in one call.
3. `popupWindow.classList.add("open")` — reveals the overlay.

`replaceChildren()` is what makes the popup reusable: each click wipes the previous Pokémon and drops in the new one.

#### fetchPokemonList(currentUrl) — with the pagination fix
Fetches a list of 20 Pokémon. The response contains ready-to-use `next` / `previous` URLs (or `null` at the edges) and a `results` array of `{ name, url }`.

**The limit/offset fix:** PokéAPI bakes the `limit` into the `next`/`previous` URLs it returns. Near the end of the list it shrinks the limit (e.g. `limit=3`), and that small limit then propagates through every following `previous` link — so going back from the last page kept showing fewer than 20. The fix normalizes every URL before fetching:
```js
const url = new URL(currentUrl);     // parse the string into an editable URL object
url.searchParams.set('limit', '20'); // force the limit back to 20
const response = await fetch(url);   // fetch the corrected URL
```
A `URL` object lets you edit query parameters safely (via `.searchParams.set/get`) instead of doing string surgery, and `fetch` accepts the object directly.

#### fetchPokemonDetails(url) — with the response.ok guard
Fetches the full data for one Pokémon:
```js
async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    if (!response.ok) return null;     // ← guard
    return await response.json();
}
```
See **What is `response.ok`?** below for why this guard matters.

#### createPokemonCard(name, details)
Builds a card with `document.createElement`: an `<h3>` name and an `<img>`. The image prefers the high-quality `dream_world` sprite and falls back to `front_default`. It also attaches a click listener that opens the popup:
```js
card.addEventListener("click", () => showDetails(details));
```
This works because of a **closure**: the listener is created inside the function call that holds *this* Pokémon's `details`, so each card "remembers" its own data. The listener body only runs later, when the tile is actually clicked.

#### renderPokedex()
The main render. It fetches the current page, saves `next`/`previous` into the globals, clears the grid, then loops the 20 results — fetching each Pokémon's details, building a card, and appending it.

#### Search (`#searchPoke`)
A `keydown` listener on the input. It acts only on **Enter**, then:
1. `searchBar.value.toLowerCase().trim()` — clean the typed text (the API uses lowercase names; trim removes stray spaces).
2. If empty → `renderPokedex()` (back to the normal grid) and return.
3. Otherwise fetch `https://pokeapi.co/api/v2/pokemon/${term}` — **the same URL accepts a name OR an id**, so one path handles both.
4. Clear `.poke_list` and render the single result.

> Note: a few Pokémon with multiple forms (e.g. `giratina`, `deoxys`, `shaymin`) have no entry under their plain name — only under a form name like `giratina-altered`. Searching the plain name returns 404. Handling that gracefully is what the `response.ok` guard + a "not found" message are for.

#### Header → home
A click listener on `.header` resets to the first page:
```js
currentUrl = HOME_URL;
renderPokedex();
searchBar.value = "";   // also clear any leftover search term
```

#### Pagination button listeners
```js
previousBtn → currentUrl = previousUrl → renderPokedex()
nextBtn     → currentUrl = nextUrl     → renderPokedex()
```
Updating `currentUrl` *before* calling `renderPokedex()` is what makes the next render fetch the right page.

---

## What is `response.ok`?

When you `fetch` a URL, the result is a **`Response` object** describing what the server sent back. `response.ok` is a boolean shortcut on it:

- `true` when the HTTP status is in the **200–299** range (success — the data is really there).
- `false` for anything else, most importantly **404 Not Found** (e.g. a Pokémon name that doesn't exist).

The important gotcha: **`fetch` does NOT throw on a 404.** A 404 is still a "successful" network round-trip as far as `fetch` is concerned — it resolves normally, just with `response.ok === false`. So if you skip the check and call `response.json()` on a 404, you try to parse an error body that isn't valid JSON, and *that* throws — often silently breaking the page with a confusing error.

That's why both fetch helpers guard with `response.ok`:
- `fetchPokemonList` uses optional chaining: `if (response?.ok) { ... }` — only parse on success (and `?.` also protects against a network failure where `response` is `undefined`).
- `fetchPokemonDetails` returns `null` when `!response.ok`, so callers can detect "not found" and show a friendly message instead of crashing.

**Rule of thumb:** after every `fetch`, check `response.ok` before calling `.json()`.

---

## Key concepts to remember

- **`#` vs `.` in selectors**: `querySelector("#searchPoke")` matches an `id`; `querySelector(".header")` matches a `class`. Mixing them up returns `null`, and the next line (e.g. `.addEventListener`) then crashes the whole script.
- **Compound selectors (no space)**: `.popup.open` = one element with *both* classes. `.popup .open` (with a space) = a descendant — a completely different meaning.
- **Closures**: a function defined inside another "remembers" the surrounding variables (like each card's `details`). The body runs later, but it captured the right data when it was created.
- **`replaceChildren()`**: clears an element's children and (optionally) inserts new ones in a single call — ideal for refreshing the popup content.
- **`fetch` + `response.ok`**: `fetch` doesn't throw on 404; always check `response.ok` before `.json()`.
- **The event object (`e` / `keypress`)**: event listeners receive an object describing what happened. The name is your choice; `e.key === "Enter"` asks "was the pressed key Enter?".
- **`URL` objects over string editing**: use `new URL(...)` + `.searchParams.set(...)` to change query params safely instead of regex/string hacks.
- **The API does the pagination math**, but it mutates `limit` near the end of the list — normalize URLs with `searchParams.set('limit','20')` to keep pages full.
