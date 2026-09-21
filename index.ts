#!/usr/bin/env node

export {getByImdbId, sanitizeImdbId} from './src/index.js';
export {
    TMDB_GENRES,
    TMDB_MOVIE_GENRES,
    TMDB_MOVIE_TO_HISPASHARE,
    TMDB_TV_GENRES,
    TMDB_TV_TO_HISPASHARE,
    TMDB_TO_HISPASHARE,
    HISPASHARE_GENRES,
} from './src/genres.js';
export type {HispashareGenreId, TmdbGenre} from './src/genres.js';
export type {
    HispashareGenre,
    TmdbCertification,
    TmdbTag,
    TmdbTitle,
} from './src/index.js';

const runCli = async (): Promise<void> => {
    const [id] = process.argv.slice(2).filter((argument) => argument !== '--');
    if (!id) {
        console.error('Usage: imdb-rip <imdb-title-id>');
        process.exitCode = 1;
        return;
    }

    try {
        const {getByImdbId} = await import('./src/index.js');
        console.log(JSON.stringify(await getByImdbId(id), null, 2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
};

if (require.main === module) {
    void runCli();
}
