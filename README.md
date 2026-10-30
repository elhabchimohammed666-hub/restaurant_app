# Maison Soleil

Application de restaurant construite avec React, Vite, Tailwind CSS, Express et MongoDB.

## Prérequis

- Node.js 20 ou plus récent
- npm
- MongoDB pour activer les opérations persistées de l'API

## Démarrage

1. Copiez `.env.example` vers `server/.env` et renseignez `MONGODB_URI` ainsi qu'un `JWT_SECRET`.
2. Depuis la racine, installez les dépendances :

   ```sh
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

3. Lancez l'interface et l'API ensemble :

   ```sh
   npm run dev
   ```

L'interface est disponible sur `http://localhost:5173` et l'API sur `http://localhost:5000/api`.
Le catalogue de démonstration est affiché côté client. Les routes API nécessitent une base MongoDB disponible.

## API principale

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id`
- `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders`, `PATCH /api/orders/:id/status`
- `POST /api/reservations`, `GET /api/reservations/mine`, `GET /api/reservations`, `PATCH /api/reservations/:id/status`

Les routes de gestion sont réservées au rôle `admin`. Les statuts de commande et de réservation sont contrôlés par l'API.
