const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const FILMAFFINITY_URL = 'https://www.filmaffinity.com/es/film';

interface WikidataBinding {
    filmAffinityId?: {value?: string};
}

interface WikidataResponse {
    results?: {
        bindings?: WikidataBinding[];
    };
}

const escapeSparqlString = (value: string): string =>
    value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

/** Returns the FilmAffinity URL associated with an IMDb ID, when available. */
export const getFilmAffinityUrl = async (
    imdbId: string
): Promise<string | null> => {
    const query = `
        SELECT ?filmAffinityId WHERE {
            ?item wdt:P345 "${escapeSparqlString(imdbId)}".
            ?item wdt:P480 ?filmAffinityId.
        }
        LIMIT 1
    `;
    const url = new URL(WIKIDATA_SPARQL_ENDPOINT);
    url.searchParams.set('query', query);
    url.searchParams.set('format', 'json');

    try {
        const response = await fetch(url, {
            headers: {
                accept: 'application/sparql-results+json',
                'user-agent': 'imdb-rip/1.0',
            },
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) return null;

        const body = (await response.json()) as WikidataResponse;
        const id = body.results?.bindings?.[0]?.filmAffinityId?.value;

        if (!id || !/^\d{6,7}$/.test(id)) return null;

        return `${FILMAFFINITY_URL}${id}.html`;
    } catch {
        return null;
    }
};
