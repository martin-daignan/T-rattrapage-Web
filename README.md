TrellMaster Web

TrellMaster Web est une application web de gestion de tâches inspirée de Trello.
Elle utilise l’API Trello via un backend Express qui gère l’authentification OAuth et proxifie toutes les requêtes.

🚀 Tech Stack

Frontend : React + TypeScript + Vite

UI : TailwindCSS + ShadCN UI

Backend : Express (Node.js)

HTTP Client : Axios

Auth : OAuth 1.0 Trello

Tests : Jest

📌 Features

🔹 Authentification sécurisée avec Trello (OAuth)

🔹 CRUD Workspaces (create / update / delete / display)

🔹 CRUD Boards (avec choix de template, ex: kanban)

🔹 CRUD Lists

🔹 CRUD Cards sur une liste

🔹 Déplacement de cards avec drag and drop

📖 API Reference (via Trello)
🔹 Créer un workspace
POST https://api.trello.com/1/organizations

Params

Parameter Type Description
api_key string Required. Votre API key
oauth_token string Required. Votre token OAuth
displayName string Nom du workspace
🔹 Récupérer les boards d’un workspace
GET https://api.trello.com/1/organizations/${organizationId}/boards

Params

Parameter Type Description
organizationId string Required. Id du workspace
api_key string Required. Votre API key
oauth_token string Required. Votre token OAuth
🔹 Mettre à jour un workspace
PUT https://api.trello.com/1/organizations/${workspaceId}

Params

Parameter Type Description
workspaceId string Required. Id du workspace
newName string Nouveau nom
api_key string Required. Votre API key
oauth_token string Required. Votre token OAuth
🔹 Supprimer un workspace
DELETE https://api.trello.com/1/organizations/${workspaceId}

Params

Parameter Type Description
workspaceId string Required. Id du workspace
api_key string Required. Votre API key
oauth_token string Required. Votre token OAuth
⚙️ Installation

Clone le repo puis installe les dépendances :

npm install

Crée un Power-Up Trello pour générer ton API Key et ton API Secret.

Ensuite crée un fichier .env à la racine du backend :

TRELLO_API_KEY=your_api_key
TRELLO_API_SECRET=your_api_secret
TRELLO_CALLBACK_URL=http://localhost:3000/auth/callback
SESSION_SECRET=your_session_secret

🚀 Démarrage
Lancer le backend Express
cd server
npm run dev

Lancer le frontend React
cd web
npm run dev

L’application sera disponible sur http://localhost:5173
.
