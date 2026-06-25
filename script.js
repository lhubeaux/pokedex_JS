let currentUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=20&offset=568'
let nextUrl = null
let previousUrl = null
async function fetchPokemonList(currentUrl) {
    const response = await fetch(currentUrl).catch(err => console.log('Erreur API'));
    if (response?.ok) {
        return await response.json();
    }
}

async function fetchPokemonDetails(url) {
    const response = await fetch(url);
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
