const HOME_URL = 'https://pokeapi.co/api/v2/pokemon/?limit=20&offset=0';
let currentUrl = HOME_URL
let nextUrl = null
let previousUrl = null

const TYPE_FR = {
    normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrique',
    grass: 'Plante', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
    ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
    rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
    steel: 'Acier', fairy: 'Fée'
};



// Crée un élément HTML, lui ajoute une classe et un texte si fournis, et le retourne
function elMaker(type, className, text){
    const el = document.createElement(type);
    if (className){el.classList.add(className)};
    if (text !== undefined){el.textContent = text};
    return el
};

const popupWindow = elMaker("div", "popup")
const detailBox = elMaker("div", "details-box")
const closeBtn = elMaker("button", "close-btn", "x")
const insideContent = elMaker("div", 'detail-content')

closeBtn.addEventListener("click", function() {
    popupWindow.classList.remove("open");});

detailBox.append(closeBtn, insideContent);
popupWindow.append(detailBox)
document.body.append(popupWindow)

// Remplit la popup avec les infos du Pokémon cliqué et l'affiche
function showDetails(details){
    const name = elMaker("h2", null, `${details.frenchName || details.name} (#${details.id})`);
    const englishName = elMaker("p", null, `Nom anglais : ${details.name[0].toUpperCase() + details.name.slice(1)}`)
    const img = elMaker("img", "detail-img");
    img.src = details.sprites.other.dream_world.front_default || details.sprites.front_default;
    const height = elMaker("p", null, `Taille : ${details.height/10} m`);
    const weight = elMaker("p", null, `Poids : ${details.weight/10} kg`);
    const typesDiv = elMaker('div', 'detail-types');
    details.types.forEach(t => {
    const badge = elMaker('span', 'type-badge', TYPE_FR[t.type.name] || t.type.name);
    badge.classList.add(`type-${t.type.name}`);
    typesDiv.appendChild(badge)});

    insideContent.replaceChildren(name, englishName, img, height, weight, typesDiv);
    popupWindow.classList.add("open")
}

const searchBar = document.querySelector("#searchPoke")
searchBar.addEventListener("keydown", async function(keypress){
if (keypress.key !== 'Enter') return;
let searchTerm = searchBar.value.toLowerCase().trim();
if (searchTerm === ""){renderPokedex(); return}
const searchResult =  await fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
const listSearch = document.querySelector(".poke_list");
listSearch.innerHTML=""
if (searchResult === null) {
const msg = elMaker("p", "not-found", "Pas de pokémon correspondant à la recherche");
listSearch.appendChild(msg);
return;
}
const result = createPokemonCard(searchResult.name, searchResult)
listSearch.classList.add('single-result');
listSearch.appendChild(result)

})

const header = document.querySelector(".header")
header.addEventListener("click", function(){
    currentUrl = HOME_URL;
    renderPokedex();
    searchBar.value = "";

})

// Récupère une page de 20 Pokémon depuis l'API et retourne la liste avec les URLs suivante/précédente
async function fetchPokemonList(currentUrl) {
    const url = new URL(currentUrl);        //fait avec Claude pcq ça m'énervait que le previous ne montre pas 20 pokémons si on arrivait au bout
    url.searchParams.set('limit', '20');
    
    const response = await fetch(url).catch(err => console.log('Erreur API'));
    if (response?.ok) {
        return await response.json();
    }
    
}

// Récupère les détails d'un Pokémon et enrichit l'objet avec son nom français via l'endpoint species
async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    if(!response.ok) return null;
    const details = await response.json();

    const speciesRes = await fetch(details.species.url);
    if (speciesRes.ok) {
        const species = await speciesRes.json();
        const frEntry = species.names.find(n => n.language.name === 'fr');
        if (frEntry) details.frenchName = frEntry.name;
    }

    return details;
}


// Construit et retourne la carte HTML d'un Pokémon (nom, image, listener pour la popup)
function createPokemonCard(name, details) {
    const pokePic = details.sprites.other.dream_world.front_default || details.sprites.front_default
    const card = document.createElement('div');
    const text = document.createElement('h3');
    const img = document.createElement('img');

    img.src = pokePic;
    img.classList.add('poke-pic');
    text.classList.add('poke-text');
    card.classList.add('poke-card');
    text.innerText = details.frenchName ||name;

    card.appendChild(text);
    card.appendChild(img);
    card.addEventListener("click", () => {showDetails(details)})

    return card;
}

// Vide la grille et la remplit avec les 20 Pokémon de la page courante
async function renderPokedex() {
    const data = await fetchPokemonList(currentUrl);
    nextUrl = data.next
    previousUrl = data.previous
    const poke_list = document.querySelector(".poke_list");
    poke_list.innerHTML = "";
    poke_list.classList.remove('single-result');

    for (let pokemon of data.results) {
        const details = await fetchPokemonDetails(pokemon.url);
        const card = createPokemonCard(pokemon.name, details);
        poke_list.appendChild(card);
    }
}

const previousBtn = document.querySelector('#previous')
previousBtn.addEventListener('click', function(){
    currentUrl = previousUrl;
    renderPokedex();
})

const nextBtn = document.querySelector('#next')
nextBtn.addEventListener('click', function(){
    currentUrl = nextUrl;
    renderPokedex();
})




renderPokedex();
