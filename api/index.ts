import {getByImdbId} from '../src/index.js';

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body, null, 2), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
        },
    });

export async function GET(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
        return json({error: 'Method not allowed'}, 405);
    }

    const url = new URL(request.url);
    const imdbId = url.searchParams.get('imdb_id');

    if (!imdbId) {
        return json({error: 'Invalid IMDb ID'}, 400);
    }

    try {
        return json(await getByImdbId(imdbId));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed';
        const status = message.includes('Invalid IMDb ID')
            ? 400
            : message.includes('could not find')
              ? 404
              : 500;
        return json({error: message}, status);
    }
}
