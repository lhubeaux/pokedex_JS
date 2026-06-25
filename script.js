const HOME_URL = 'https://pokeapi.co/api/v2/pokemon/?limit=20&offset=0';
let currentUrl = HOME_URL
let nextUrl = null
let previousUrl = null


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

function showDetails(details){
    const name = elMaker("h2", null, `${details.name} (#${details.id})`);
    const img = elMaker("img", "detail-img");
    img.src = details.sprites.other.dream_world.front_default || details.sprites.front_default;
    const height = elMaker("p", null, `${details.height/10} m`);
    const weight = elMaker("p", null, `${details.weight/10} kg`);
    const types = elMaker("p", null, `Types: ${details.types.map(t => t.type.name).join(", ")}`);
    insideContent.replaceChildren(name, img, height, weight, types);
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
    const msg = elMaker("p", "not-found", "No pokémon found");
    listSearch.appendChild(msg);
    return;
}
    const result = createPokemonCard(searchResult.name, searchResult)
    listSearch.appendChild(result)

})

const header = document.querySelector(".header")
header.addEventListener("click", function(){
    currentUrl = HOME_URL;
    renderPokedex();
    searchBar.value = "";

})

async function fetchPokemonList(currentUrl) {
    const url = new URL(currentUrl);        //fait avec Claude pcq ça m'énervait que le previous ne montre pas 20 pokémons si on arrivait au bout
    url.searchParams.set('limit', '20');
    
    const response = await fetch(url).catch(err => console.log('Erreur API'));
    if (response?.ok) {
        return await response.json();
    }
}

async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    if(!response.ok) return null;
    return await response.json();
}

function createPokemonCard(name, details) {
    const pokePic = details.sprites.other.dream_world.front_default || details.sprites.front_default
    const card = document.createElement('div');
    const text = document.createElement('h3');
    const img = document.createElement('img');

    img.src = pokePic;
    img.classList.add('poke-pic');
    text.classList.add('poke-text');
    card.classList.add('poke-card');
    text.innerText = name;

    card.appendChild(text);
    card.appendChild(img);
    card.addEventListener("click", () => {showDetails(details)})

    return card;
}

async function renderPokedex() {
    const data = await fetchPokemonList(currentUrl);
    nextUrl = data.next
    previousUrl = data.previous
    const poke_list = document.querySelector(".poke_list");
    poke_list.innerHTML = "";

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
