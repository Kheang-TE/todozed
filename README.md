# Todozed — Frontend Vanilla JS

Interface web de gestion de tâches (todo list) construite en **HTML**, **CSS** et **JavaScript** vanilla. Se connecte à l'API REST [Todofony](../todofony/) pour l'authentification et la gestion des tâches.

## Table des matières

- [Aperçu](#aperçu)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Pages](#pages)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Configuration](#configuration)

## Aperçu

Todozed est une application frontend légère qui consomme l'API Todofony. L'authentification est gérée via des cookies JWT HttpOnly, donc aucun token n'est stocké côté client.

## Prérequis

- Un navigateur web moderne
- L'API [Todofony](https://github.com/Kheang-TE/todofony) en cours d'exécution
- Un serveur HTTP local (ex: Live Server, `python -m http.server`, `npx serve`)

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd todozed

# Lancer un serveur local (exemples)
# Avec Python
python3 -m http.server 3000

# Avec Node.js
npx serve -l 3000

# Ou utiliser l'extension VS Code "Live Server"
```

> **Important** : L'URL du serveur doit correspondre à la configuration CORS de l'API Todofony (`CORS_ALLOW_ORIGIN`).

## Pages

### Connexion — `index.html`

- Formulaire de connexion (email + mot de passe)
- Redirection automatique vers le tableau de bord si déjà connecté
- Lien vers la page d'inscription

### Inscription — `register.html`

- Formulaire d'inscription (email + mot de passe + confirmation)
- Vérification côté client que les mots de passe correspondent
- Redirection vers la page de connexion après inscription réussie

### Tableau de bord — `board.html`

- Affichage de toutes les tâches de l'utilisateur connecté
- Bouton de déconnexion dans l'en-tête
- Affichage de l'email de l'utilisateur connecté

#### Gestion des tâches

| Action    | Description                                      |
|-----------|--------------------------------------------------|
| Ajouter   | Modal avec champ titre → crée une nouvelle tâche |
| Modifier  | Modal avec titre + sélecteur de statut           |
| Supprimer | Modal de confirmation avant suppression          |

#### Statuts des tâches

| Statut  | Couleur   | Description       |
|---------|-----------|-------------------|
| `todo`  | 🔵 Bleu   | À faire           |
| `doing` | 🟠 Orange | En cours          |
| `done`  | 🟢 Vert   | Terminé           |

## Fonctionnalités

- **Authentification par cookie** : les credentials sont envoyés avec chaque requête (`credentials: 'include'`), aucun token stocké en localStorage
- **Redirection automatique** : vérification de l'état de connexion sur chaque page via `/api/me`
- **Templates HTML** : utilisation de `<template>` pour les modals et les éléments de tâche
- **Délégation d'événements** : un seul listener sur la liste des tâches pour gérer les boutons éditer/supprimer
- **Mise à jour du DOM en temps réel** : ajout, modification et suppression sans rechargement de page
- **Icônes** : Font Awesome 7.0.1 (CDN)

## Architecture

```
todozed/
├── index.html          # Page de connexion
├── register.html       # Page d'inscription
├── board.html          # Tableau de bord (tâches)
└── assets/
    ├── css/
    │   └── style.css   # Styles de l'application
    └── js/
        ├── auth.js     # Classe Auth (login, register, logout, session)
        └── task.js     # Classe Task (CRUD tâches, modals, rendu)
```

### JavaScript

**`auth.js`** — Classe `Auth`
| Méthode            | Description                                       |
|--------------------|---------------------------------------------------|
| `fetchApi()`       | Wrapper fetch avec JSON headers et credentials     |
| `isAuthenticated()`| Vérifie la session via GET `/api/me`              |
| `login(e)`         | POST `/api/login` → redirection vers board        |
| `register(e)`      | POST `/api/register` → redirection vers login     |
| `logout()`         | POST `/api/logout` → redirection vers login       |

**`task.js`** — Classe `Task`
| Méthode              | Description                                    |
|----------------------|------------------------------------------------|
| `getAllTasks()`       | GET `/api/tasks` → liste des tâches           |
| `createTask(data)`   | POST `/api/tasks/create`                       |
| `editTask(id, data)` | PATCH `/api/tasks/edit/{id}`                   |
| `deleteTask(id)`     | DELETE `/api/tasks/remove/{id}`                |
| `renderTasks()`      | Récupère et affiche toutes les tâches          |
| `openAddTaskModal()` | Ouvre le modal d'ajout de tâche                |
| `openEditTaskModal()` | Ouvre le modal d'édition (titre + statut)     |
| `openDeleteTaskModal()`| Ouvre le modal de confirmation de suppression|

## Configuration

L'URL de l'API est définie dans `assets/js/auth.js` et `assets/js/task.js` :

```javascript
this.apiUrl = 'http://localhost:8000/api';
```

## Design

- **Couleur principale** : Rouge `#d50032`
- **Texte** : Gris `#545454`
- **Layout** : Centré, cartes de 600-640px de large
- **Modals** : Overlay semi-transparent avec carte centrée
- **Responsive** : Largeur maximale fixe, adapté aux écrans standards
