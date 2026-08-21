# 🏆 Gestion de compétition e-sport

API REST pour la gestion de compétitions e-sport, développée avec Node.js, Express et MongoDB. Le projet couvre la gestion des utilisateurs, des rôles, des équipes, des tournois et des inscriptions, avec une authentification JWT et des contrôles d'accès par rôle.

## ✨ Fonctionnalités

- Inscription et connexion des utilisateurs
- Authentification avec JSON Web Token (JWT)
- Modification du profil utilisateur
- Gestion des rôles `user`, `organisateur` et `admin`
- Création et gestion des équipes
- Ajout et retrait de membres par le capitaine
- Création, modification et suppression de tournois
- Inscription d'une équipe à un tournoi ouvert
- Consultation des tournois ouverts
- Consultation des équipes inscrites à un tournoi
- Statistiques de participation pour les administrateurs
- Validation des emails, mots de passe et identifiants MongoDB
- Protection des routes avec middleware d'authentification
- Protection HTTP avec Helmet
- CORS et limitation du nombre de requêtes

## 🛠 Technologies utilisées

- **Node.js** — environnement d'exécution
- **Express** — framework backend
- **MongoDB** / **Mongoose** — base de données et ODM
- **JWT** — authentification
- **bcryptjs** — hachage des mots de passe
- **validator** — validation des données entrantes
- **Helmet** — sécurisation des en-têtes HTTP
- **CORS** — contrôle des origines autorisées
- **express-rate-limit** — limitation des requêtes
- **Jest** et **Axios** — tests d'intégration

## ✅ Prérequis

- Node.js v18 ou supérieur recommandé
- npm
- MongoDB local ou distant, par exemple MongoDB Atlas

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine du projet :

```env
MONGODB_URI=mongodb://localhost:27017/gestion-esport-competition
JWT_SECRET=un_secret_jwt_fort
```

`MONGODB_URI` doit pointer vers une instance MongoDB accessible. `JWT_SECRET` est utilisé pour signer les tokens d'authentification.

## 🚀 Lancement

Le projet ne possède pas encore de scripts `start` ou `dev` dans `package.json`.

```bash
node app.js
```

Le serveur est accessible par défaut sur `http://localhost:3000`.

## 📁 Structure du projet

```text
├── config/
│   └── db.js                 # Connexion MongoDB
├── controllers/              # Logique métier des routes
├── middlewares/              # Authentification JWT
├── models/                   # Schémas Mongoose
├── routes/                   # Définition des endpoints
├── tests/                    # Tests d'intégration Jest
├── app.js                    # Configuration et démarrage de l'API
├── package.json
└── README.md
```

## 🔌 Endpoints principaux

Toutes les routes protégées nécessitent l'en-tête suivant :

```http
Authorization: Bearer <token>
```

### 🔑 Auth (`/api/v1/auth`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|:---:|
| POST | `/register` | Créer un compte utilisateur | ❌ |
| POST | `/login` | Se connecter et obtenir un token JWT | ❌ |
| PATCH | `/updateProfile` | Modifier son profil | ✅ |
| PUT | `/users/:userId/role` | Modifier le rôle d'un utilisateur | ✅ Admin |

### 👥 Équipes (`/api/v1/team`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|:---:|
| POST | `/createTeam` | Créer une équipe | ✅ |
| POST | `/:teamId/join` | Rejoindre une équipe | ✅ |
| POST | `/:teamId/members` | Ajouter un membre, capitaine uniquement | ✅ |
| DELETE | `/:teamId/members/:userId` | Retirer un membre, capitaine uniquement | ✅ |
| DELETE | `/:teamId/deleteTeam` | Supprimer une équipe | ✅ Admin |
| GET | `/:teamId/teamDetails` | Consulter les détails d'une équipe | ✅ |
| GET | `/:teamId/teamTournaments` | Consulter les tournois de son équipe | ✅ Membre |

### 🏆 Tournois (`/api/v1/tournament`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|:---:|
| POST | `/createTournament` | Créer un tournoi | ✅ Organisateur ou admin |
| PATCH | `/:tournamentId/updateTournament` | Modifier un tournoi créé | ✅ Propriétaire |
| DELETE | `/:tournamentId/deleteTournament` | Supprimer un tournoi | ✅ Propriétaire ou admin |
| POST | `/:tournamentId/register` | Inscrire une équipe à un tournoi | ✅ Membre de l'équipe |
| GET | `/open` | Lister les tournois ouverts | ✅ |
| GET | `/:tournamentId/teams` | Voir les équipes inscrites | ✅ Organisateur |
| GET | `/stats` | Voir les statistiques de participation | ✅ Admin |

## 🔒 Sécurité

- JWT pour authentifier les utilisateurs
- Mots de passe hachés avec bcryptjs
- Middleware d'authentification sur les routes privées
- Autorisations contrôlées selon le rôle ou la propriété de la ressource
- Helmet pour sécuriser les en-têtes HTTP
- CORS configuré pour `http://localhost:3000`
- Limitation globale à 100 requêtes par IP toutes les 15 minutes
- Validation des emails et mots de passe
- Validation des identifiants MongoDB avant les requêtes
- Les champs sensibles comme `role` et `email` ne sont pas modifiables via le profil

## 🧪 Tests

Les tests utilisent Jest et Axios. Le serveur API doit être démarré avant l'exécution de la suite :

```bash
node app.js
npm test
```

La suite couvre actuellement 19 scénarios exécutés et un scénario `todo` pour US3, car aucune route correspondant à cette story n'est présente dans l'API.

Les stories protégées par les rôles organisateur et administrateur sont vérifiées sur leurs contrôles d'autorisation. Pour tester leurs parcours de succès, une fixture ou un utilisateur disposant de ces rôles doit être configuré en base.

## 👤 Auteur

Projet **Gestion Esport Competition** — API de gestion de compétitions e-sport.
