# einkaufsliste-svelte

Frontend for [c-jaenicke/einkaufsliste-go-gin](https://github.com/c-jaenicke/einkaufsliste-go-gin).
Made using [SvelteKit (kit.svelte.dev)](https://kit.svelte.dev/)
and [Skeleton (skeleton.dev)](https://www.skeleton.dev/).

## npm run

```shell
npm run
Scripts available in einkaufsliste-svelte-skeleton@0.0.1 via `npm run-script`:
  dev
    vite dev
  build
    vite build
  preview
    vite preview
  check
    svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
  check:watch
    svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch
  lint
    prettier --plugin-search-dir . --check . && eslint .
  format
    prettier --plugin-search-dir . --write .
```

## Deployment

Example deploying frontend in docker compose file:

```yaml
services:
  frontend:
    container_name: einkaufsliste-frontend
    hostname: einkaufsliste-frontend
    image: einkaufsliste-svelte:latest
    restart: unless-stopped
    environment:
      - 'ORIGIN=http://localhost:3000'
    ports:
      - 3000:3000
```

The environment variable `ORIGIN` can be set in the `.env` file when building the docker image or in the docker-compose file.

The environment variable `API_BASE` **MUST BE SET in the `.env` file when building the docker image!!**
Must follow this pattern `http://<container-name>:<port>`.

### .env

`API_BASE` is required to build docker image currently.
Has to be `http://localhost:8080` for local development,
and `http://einkaufsliste-api:8080` when building the docker image.

*Idk if this is correct, but has worked for me.*

`ORIGIN` has be set to allow client-side POST requests.

```env
# hostname of backend container with port
# local development mode
API_BASE="http://localhost:8080"
# prodction mode
#API_BASE="http://einkaufsliste-api:8080"

# NODE ADAPTER SETTINGS https://kit.svelte.dev/docs/adapter-node
#HOST=
#PORT=
ORIGIN="http://localhost:3000"
```
