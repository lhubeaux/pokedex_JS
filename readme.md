# Pokédex JS

Pokédex vanilla JavaScript qui récupère et affiche les Pokémon depuis [PokéAPI](https://pokeapi.co/).

Projet d'apprentissage — aucun framework, aucun outil de build.

## Fonctionnalités

- Grille paginée (20 Pokémon/page) avec boutons page précédente / suivante
- Noms en français via l'endpoint `/pokemon-species`
- Clic sur une carte → popup avec nom FR, nom EN, sprite, taille, poids, pastilles de type colorées
- Recherche par nom (anglais) ou ID — touche Entrée
- Clic sur le header → retour à la première page

## Lancer le projet

Ouvrir `index.html` directement dans un navigateur. Aucune installation requise.

## Stack

- HTML / CSS / JavaScript vanilla
- [PokéAPI](https://pokeapi.co/) — données et sprites
- [Google Fonts — Electrolize](https://fonts.google.com/specimen/Electrolize)

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page |
| `style.css` | Styles et thème |
| `script.js` | Logique et appels API |
| `explications.md` | Notes techniques d'apprentissage |
