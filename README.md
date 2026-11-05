# Git en clair

Site statique de révision du cours **Versioning Git**, entièrement en français.
Il fonctionne sur GitHub Pages et ne nécessite ni backend ni étape de build.

## Structure

- `index.html` : accueil et progression.
- `cours.html` : cours progressif, commandes, schémas SVG/CSS et exercices.
- `memo.html` : fiche imprimable.
- `quiz.html` : quiz aléatoire, par chapitre, flashcards et examen.
- `glossaire.html` : définitions essentielles.
- `css/` : styles d'écran et d'impression.
- `js/` : navigation, thème, copier-coller, glossaire et quiz.
- `data/quiz.json` : questions facilement extensibles.
- `.github/prompts/ui-ux-pro-max/` : design system généré par `uipro init --ai copilot`.

## Ajouter une question

Ajoutez un objet dans `data/quiz.json` :

```json
{
  "c": "bases",
  "q": "Votre question ?",
  "o": ["Réponse A", "Réponse B", "Réponse C"],
  "a": 1,
  "e": "Explication courte.",
  "l": "cours.html#cycle"
}
```

`a` est l'index (à partir de zéro) de la bonne réponse. `c` sert au filtre par
chapitre et `l` doit pointer vers la section de cours correspondante.

## Tester localement

Le quiz charge son JSON avec `fetch`, donc utilisez un serveur statique :

```bash
python -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

## Publier sur GitHub Pages

1. Poussez le contenu sur la branche `main`.
2. Dans **Settings → Pages**, choisissez **Deploy from a branch**.
3. Sélectionnez `main` et le dossier `/ (root)`, puis enregistrez.

Tous les liens sont relatifs : le site fonctionne aussi dans un sous-chemin
GitHub Pages.

## Choix modernes

Le cours privilégie `git switch` et `git restore`, tout en expliquant que
`git checkout` reste rencontré dans les anciens supports. Le vocabulaire
`main` est utilisé à la place de `master`, sans modifier les dépôts existants.
