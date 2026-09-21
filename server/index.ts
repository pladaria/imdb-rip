import {createServer, type ServerResponse} from 'node:http';
import {loadEnvFile} from 'node:process';
import {getByImdbId} from '../src/index.js';

try {
    loadEnvFile();
} catch (error) {
    if (
        !(
            error instanceof Error &&
            'code' in error &&
            (error as NodeJS.ErrnoException).code === 'ENOENT'
        )
    ) {
        throw error;
    }
}

const port = Number(process.env.PORT ?? 3000);

const sendJson = (
    response: ServerResponse,
    status: number,
    body: unknown
): void => {
    const payload = JSON.stringify(body, null, 2);
    response.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(payload),
    });
    response.end(payload);
};

const server = createServer(async (request, response) => {
    const requestUrl = new URL(
        request.url ?? '/',
        `http://${request.headers.host ?? 'localhost'}`
    );
    const match = requestUrl.pathname.match(/^\/imdb\/([^/]+)\/?$/);

    if (request.method !== 'GET') {
        sendJson(response, 405, {error: 'Method not allowed'});
        return;
    }

    if (!match) {
        sendJson(response, 404, {error: 'Not found'});
        return;
    }

    let imdbId: string;
    try {
        imdbId = decodeURIComponent(match[1]);
    } catch {
        sendJson(response, 400, {error: 'Invalid IMDb ID'});
        return;
    }

    try {
        sendJson(response, 200, await getByImdbId(imdbId));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed';
        const status = message.includes('Invalid IMDb ID')
            ? 400
            : message.includes('could not find')
              ? 404
              : 500;
        sendJson(response, status, {error: message});
    }
});

server.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
