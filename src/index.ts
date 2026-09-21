import {COUNTRY_NAMES_ES} from './country-names-es.js';
import {
    TMDB_MOVIE_TO_HISPASHARE,
    TMDB_TV_TO_HISPASHARE,
    type TmdbGenre,
} from './genres.js';
import {
    TmdbHttpClient,
    type TmdbDetails,
    type TmdbKeyword,
} from './tmdb.js';
import {getFilmAffinityUrl} from './wikidata.js';

const IMDB_ID_PATTERN = /\b(tt\d+)\b/i;

export const sanitizeImdbId = (input: string): string => {
    const match = input.match(IMDB_ID_PATTERN);
    if (!match) {
        throw new Error('Invalid IMDb ID');
    }

    return match[1].toLowerCase();
};

export interface TmdbCountry {
    iso: string;
    name: string;
    name_es: string;
}

export interface TmdbPerson {
    id: number;
    name: string;
}

export interface TmdbCertification {
    us: string | null;
    es: string | null;
}

export interface HispashareGenre {
    id: number;
    name: string;
    hs_ids: string[];
}

export interface TmdbTag {
    id: number;
    name: string;
}

export interface TmdbTitle {
    title: string;
    original_title: string;
    type: 'movie' | 'series';
    imdb_id: string;
    imdb_url: string;
    filmaffinity_url: string | null;
    country: TmdbCountry[];
    genres: HispashareGenre[];
    tags: TmdbTag[];
    year: number | null;
    duration: number | null;
    score: number | null;
    votes: number | null;
    certification: TmdbCertification;
    synopsis: string;
    director: TmdbPerson[];
    cast: TmdbPerson[];
}

const getYear = (details: TmdbDetails): number | null => {
    const date =
        details.release_date ??
        details.first_air_date ??
        details.air_date ??
        '';
    const year = Number(date.slice(0, 4));
    return /^\d{4}$/.test(date.slice(0, 4)) ? year : null;
};

const getCountries = (details: TmdbDetails): TmdbCountry[] =>
    (details.production_countries ?? []).map(
        ({iso_3166_1: iso, name}) => ({
            iso,
            name,
            name_es: COUNTRY_NAMES_ES[iso] ?? name,
        })
    );

const getGenres = (details: TmdbDetails): TmdbGenre[] =>
    (details.genres ?? []).map(({id, name}) => ({id, name}));

const getTags = (details: TmdbDetails): TmdbTag[] => {
    const keywords =
        details.keywords?.keywords ?? details.keywords?.results ?? [];

    return keywords
        .filter(
            (keyword): keyword is TmdbKeyword & {id: number; name: string} =>
                keyword.id !== undefined && keyword.name !== undefined
        )
        .map(({id, name}) => ({id, name}));
};

const getMappedGenres = (
    details: TmdbDetails,
    type: TmdbTitle['type']
): HispashareGenre[] => {
    const mappings =
        type === 'movie'
            ? TMDB_MOVIE_TO_HISPASHARE
            : TMDB_TV_TO_HISPASHARE;

    return getGenres(details).map(({id, name}) => ({
        id,
        name,
        hs_ids: [...(mappings[id] ?? [])],
    }));
};

const getDirectors = (
    details: TmdbDetails,
    type: TmdbTitle['type']
): TmdbPerson[] => {
    const creators = type === 'series' ? details.created_by ?? [] : [];
    const directors = (details.credits?.crew ?? []).filter(
        ({job}) => job === 'Director'
    );
    const people = [...creators, ...directors];
    const uniquePeople = new Map<number, TmdbPerson>();

    for (const person of people) {
        if (person.id && person.name && !uniquePeople.has(person.id)) {
            uniquePeople.set(person.id, {
                id: person.id,
                name: person.name,
            });
        }
    }

    return [...uniquePeople.values()];
};

const getCast = (details: TmdbDetails): TmdbPerson[] =>
    (details.credits?.cast ?? [])
        .filter(({id, name}) => id && name)
        .map(({id, name}) => ({id: id as number, name: name as string}));

const getDuration = (details: TmdbDetails): number | null =>
    details.runtime ??
    details.episode_run_time?.[0] ??
    details.last_episode_to_air?.runtime ??
    details.next_episode_to_air?.runtime ??
    null;

const getCertification = (details: TmdbDetails): string | null => {
    const spanishMovieRating = details.release_dates?.results
        ?.find(({iso_3166_1}) => iso_3166_1 === 'ES')
        ?.release_dates?.find(({certification}) => certification)?.certification;
    if (spanishMovieRating) return spanishMovieRating;

    const anyMovieRating = details.release_dates?.results
        ?.flatMap(({release_dates = []}) => release_dates)
        .find(({certification}) => certification)?.certification;
    if (anyMovieRating) return anyMovieRating;

    const spanishTvRating = details.content_ratings?.results?.find(
        ({iso_3166_1}) => iso_3166_1 === 'ES'
    )?.rating;
    if (spanishTvRating) return spanishTvRating;

    return (
        details.content_ratings?.results?.find(({rating}) => rating)?.rating ??
        null
    );
};

const getUsCertification = (details: TmdbDetails): string | null => {
    const movieRating = details.release_dates?.results
        ?.find(({iso_3166_1}) => iso_3166_1 === 'US')
        ?.release_dates?.find(({certification}) => certification)?.certification;
    if (movieRating) return movieRating;

    return (
        details.content_ratings?.results?.find(
            ({iso_3166_1, rating}) => iso_3166_1 === 'US' && rating
        )?.rating ?? null
    );
};

const normalizeDetails = (
    details: TmdbDetails,
    imdbId: string,
    type: TmdbTitle['type'],
    filmaffinityUrl: string | null
): TmdbTitle => ({
    title: details.title ?? details.name ?? '',
    original_title:
        details.original_title ??
        details.original_name ??
        details.title ??
        details.name ??
        '',
    type,
    imdb_id: imdbId,
    imdb_url: `https://www.imdb.com/title/${imdbId}/`,
    filmaffinity_url: filmaffinityUrl,
    country: getCountries(details),
    genres: getMappedGenres(details, type),
    tags: getTags(details),
    year: getYear(details),
    duration: getDuration(details),
    score: details.vote_average ?? null,
    votes: details.vote_count ?? null,
    certification: {
        us: getUsCertification(details),
        es: getCertification(details),
    },
    synopsis: details.overview ?? '',
    director: getDirectors(details, type),
    cast: getCast(details),
});

const getNormalizedDetails = async (
    detailsPromise: Promise<TmdbDetails>,
    imdbId: string,
    type: TmdbTitle['type']
): Promise<TmdbTitle> => {
    const [details, filmaffinityUrl] = await Promise.all([
        detailsPromise,
        getFilmAffinityUrl(imdbId),
    ]);

    return normalizeDetails(details, imdbId, type, filmaffinityUrl);
};

/** Returns the whitelisted metadata for an IMDb ID. */
export const getByImdbId = async (imdbId: string): Promise<TmdbTitle> => {
    const sanitizedImdbId = sanitizeImdbId(imdbId);
    const client = new TmdbHttpClient();
    const found = await client.findByImdbId(sanitizedImdbId);

    const movie = found.movie_results?.[0];
    if (movie) {
        return getNormalizedDetails(
            client.getDetails('movie', movie.id),
            sanitizedImdbId,
            'movie'
        );
    }

    const tv = found.tv_results?.[0];
    if (tv) {
        return getNormalizedDetails(
            client.getDetails('tv', tv.id),
            sanitizedImdbId,
            'series'
        );
    }

    const episode = found.tv_episode_results?.[0];
    if (
        episode &&
        episode.show_id !== undefined &&
        episode.season_number !== undefined &&
        episode.episode_number !== undefined
    ) {
        return getNormalizedDetails(
            client.getEpisodeDetails(
                episode.show_id,
                episode.season_number,
                episode.episode_number
            ),
            sanitizedImdbId,
            'series'
        );
    }

    throw new Error(
        `TMDB could not find a title for IMDb ID ${sanitizedImdbId}`
    );
};
