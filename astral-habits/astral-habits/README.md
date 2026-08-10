# ✦ Astral

**Chaque jour tenu allume une étoile.**

Astral est un suivi d'habitudes minimaliste qui transforme ta régularité en ciel étoilé. Chaque habitude devient une étoile : plus ta série de jours consécutifs est longue, plus elle brille. Coche-la aujourd'hui, et elle s'illumine en or.

Pas de compte, pas de serveur, pas de tracking : tout reste dans le `localStorage` de ton navigateur.

## Aperçu

- **Une constellation vivante** — chaque habitude occupe une position fixe dans le ciel, reliée aux autres comme une vraie constellation.
- **La taille = la constance** — le rayon de l'étoile grandit avec le nombre de jours consécutifs.
- **Zéro friction** — ajouter une habitude, cocher le jour, et c'est tout.
- **100 % local** — aucune donnée envoyée nulle part, aucune dépendance à un backend.

## Stack

Vanilla HTML / CSS / JavaScript. Aucune dépendance, aucun build. Le projet tient dans trois fichiers :

```
index.html   → structure de la page
style.css    → identité visuelle (thème nocturne)
app.js       → logique : stockage, streaks, rendu du ciel en SVG
```

## Lancer le projet en local

Aucune installation nécessaire — c'est du HTML statique.

```bash
git clone https://github.com/<ton-pseudo>/astral-habits.git
cd astral-habits
```

Puis ouvre simplement `index.html` dans ton navigateur, ou sers le dossier avec un petit serveur local :

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Déployer sur GitHub Pages

1. Va dans **Settings → Pages** du dépôt.
2. Source : branche `main`, dossier `/ (root)`.
3. Enregistre. Le site sera disponible à `https://<ton-pseudo>.github.io/astral-habits/` en quelques minutes.

## Idées d'évolution

- Export / import des données en JSON
- Historique complet par habitude (pas seulement la série en cours)
- Mode clair
- Rappels via notifications navigateur

## Licence

MIT — fais-en ce que tu veux, voir [LICENSE](LICENSE).
