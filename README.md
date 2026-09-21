# imdb-rip

TMDB metadata client, written in TypeScript. It looks up movie, TV and episode
metadata using an IMDb ID, so it does not scrape IMDb HTML. When available, it
also resolves the FilmAffinity URL through Wikidata.
Requires Node.js 20.18.1 or newer.

```sh
pnpm install
pnpm build
```

Create a `.env` file with your TMDB v3 API key:

```env
TMDB_API_KEY=your_api_key
```

## CLI

Pass an IMDb ID to print the TMDB response as JSON:

```sh
pnpm build
pnpm cli -- tt7221388
# alternativamente:
pnpm start -- tt7221388
# or, after installing the package:
imdb-rip tt7221388
```

The input can also be an IMDb URL; the `tt...` identifier is extracted
automatically:

```sh
pnpm cli -- https://www.imdb.com/title/tt7221388/
```

## API

Start the HTTP API:

```sh
pnpm api
```

Then request a title by its IMDb ID:

```sh
curl http://localhost:3000/imdb/tt7221388
```

## Deploy to Vercel

Import this repository into Vercel and add `TMDB_API_KEY` as an environment
variable in the project settings. The public endpoint will be:

```text
https://your-project.vercel.app/imdb/tt7221388
```

The response includes `filmaffinity_url` when Wikidata has a FilmAffinity ID
for the requested IMDb title; otherwise its value is `null`.

Use the compiled CommonJS package from `dist/index.js`:

```js
const {getByImdbId} = require('imdb-rip');
const title = await getByImdbId('tt7221388');
```
