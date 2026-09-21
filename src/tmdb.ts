import {loadEnvFile} from 'node:process';

const TMDB_API_ORIGIN = 'https://api.themoviedb.org';
const TMDB_LANGUAGE = 'es-ES';

let envLoaded = false;

const loadEnvironment = (): void => {
    if (envLoaded) return;
    envLoaded = true;

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
};

export interface TmdbFindResponse {
    movie_results?: TmdbFindResult[];
    tv_results?: TmdbFindResult[];
    tv_episode_results?: TmdbFindResult[];
    person_results?: TmdbFindResult[];
}

export interface TmdbFindResult {
    id: number;
    show_id?: number;
    season_number?: number;
    episode_number?: number;
}

export interface TmdbKeyword {
    id?: number;
    name?: string;
}

export interface TmdbProductionCountry {
    iso_3166_1: string;
    name: string;
    name_es?: string;
}

export interface TmdbEpisodeSummary {
    runtime?: number | null;
}

export interface TmdbDetails {
    [key: string]: unknown;
    id?: number;
    title?: string;
    original_title?: string;
    release_date?: string;
    name?: string;
    original_name?: string;
    first_air_date?: string;
    air_date?: string;
    overview?: string;
    vote_average?: number;
    vote_count?: number;
    poster_path?: string | null;
    genres?: Array<{id: number; name: string}>;
    production_countries?: TmdbProductionCountry[];
    origin_country?: string[];
    runtime?: number | null;
    episode_run_time?: number[];
    created_by?: Array<{id?: number; name?: string}>;
    last_episode_to_air?: TmdbEpisodeSummary;
    next_episode_to_air?: TmdbEpisodeSummary;
    credits?: {
        cast?: Array<{id?: number; name?: string}>;
        crew?: Array<{id?: number; name?: string; job?: string}>;
    };
    keywords?: {
        keywords?: TmdbKeyword[];
        results?: TmdbKeyword[];
    };
    release_dates?: {
        results?: Array<{
            iso_3166_1?: string;
            release_dates?: Array<{
                release_date?: string;
                certification?: string;
                note?: string;
            }>;
        }>;
    };
    content_ratings?: {
        results?: Array<{
            iso_3166_1?: string;
            rating?: string;
        }>;
    };
    alternative_titles?: {
        titles?: Array<{iso_3166_1?: string; title?: string}>;
        results?: Array<{iso_3166_1?: string; title?: string}>;
    };
    external_ids?: Record<string, string | null | undefined>;
}

export class TmdbApiError extends Error {
    constructor(status: number, message: string) {
        super(`TMDB request failed: ${status} ${message}`);
        this.name = 'TmdbApiError';
    }
}

export class TmdbHttpClient {
    private readonly credential: {
        type: 'api-key' | 'bearer';
        value: string;
    };

    constructor() {
        loadEnvironment();
        const configuredApiKey = process.env.TMDB_API_KEY?.trim();
        const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();

        if (!configuredApiKey && !accessToken) {
            throw new Error(
                'Missing TMDB_API_KEY or TMDB_API_READ_ACCESS_TOKEN. Add one to .env or the environment.'
            );
        }
        if (configuredApiKey && accessToken) {
            throw new Error(
                'Set only one of TMDB_API_KEY or TMDB_API_READ_ACCESS_TOKEN.'
            );
        }

        this.credential = accessToken
            ? {type: 'bearer', value: accessToken}
            : {type: 'api-key', value: configuredApiKey as string};
    }

    private async get<T>(
        path: string,
        params: Record<string, string> = {}
    ): Promise<T> {
        const url = new URL(`/3${path}`, TMDB_API_ORIGIN);
        const headers = new Headers({accept: 'application/json'});
        if (this.credential.type === 'api-key') {
            url.searchParams.set('api_key', this.credential.value);
        } else {
            headers.set('authorization', `Bearer ${this.credential.value}`);
        }
        url.searchParams.set('language', TMDB_LANGUAGE);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, {headers});
        const body = (await response.json()) as T & {
            status_message?: string;
        };

        if (!response.ok) {
            const message =
                body.status_message
                    ? body.status_message
                    : response.statusText;
            throw new TmdbApiError(response.status, message);
        }

        return body;
    }

    public findByImdbId(id: string): Promise<TmdbFindResponse> {
        return this.get<TmdbFindResponse>(`/find/${encodeURIComponent(id)}`, {
            external_source: 'imdb_id',
        });
    }

    public getDetails(
        type: 'movie' | 'tv',
        id: number
    ): Promise<TmdbDetails> {
        const append =
            type === 'movie'
                ? 'credits,keywords,release_dates,alternative_titles,external_ids'
                : 'credits,keywords,alternative_titles,external_ids,content_ratings';
        return this.get<TmdbDetails>(`/${type}/${id}`, {
            append_to_response: append,
        });
    }

    public getEpisodeDetails(
        showId: number,
        seasonNumber: number,
        episodeNumber: number
    ): Promise<TmdbDetails> {
        return this.get<TmdbDetails>(
            `/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`,
            {append_to_response: 'credits,external_ids'}
        );
    }
}
