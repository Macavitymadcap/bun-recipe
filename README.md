# Bun Recipes

A web app enabling CRUD operations for recipes, written in TypeScript using the
Bun runtime, deployed on Railway.

## Dependencies

- Typescript
- Bun
- Hono
- Postgres
- HTMX
- Alpine.js
- JSX
- Decimal.js

## Getting Started

The app requires a connection to a Postgres instance to run. This is configured 
through variables in the railway instance for deployments, but for local
connections create a `.env` file with a `DATABASE_URL` variable containing a
connection string.

Then, run `bun run start` to spin in up.