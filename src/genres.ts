export interface TmdbGenre {
    id: number;
    name: string;
}

export const TMDB_MOVIE_GENRES: readonly TmdbGenre[] = [
    {id: 28, name: 'Acción'},
    {id: 12, name: 'Aventura'},
    {id: 16, name: 'Animación'},
    {id: 35, name: 'Comedia'},
    {id: 80, name: 'Crimen'},
    {id: 99, name: 'Documental'},
    {id: 18, name: 'Drama'},
    {id: 10751, name: 'Familia'},
    {id: 14, name: 'Fantasía'},
    {id: 36, name: 'Historia'},
    {id: 27, name: 'Terror'},
    {id: 10402, name: 'Música'},
    {id: 9648, name: 'Misterio'},
    {id: 10749, name: 'Romance'},
    {id: 878, name: 'Ciencia ficción'},
    {id: 10770, name: 'Película de TV'},
    {id: 53, name: 'Suspense'},
    {id: 10752, name: 'Bélica'},
    {id: 37, name: 'Western'},
];

export const TMDB_TV_GENRES: readonly TmdbGenre[] = [
    {id: 10759, name: 'Acción & Aventura'},
    {id: 16, name: 'Animación'},
    {id: 35, name: 'Comedia'},
    {id: 80, name: 'Crimen'},
    {id: 99, name: 'Documental'},
    {id: 18, name: 'Drama'},
    {id: 10751, name: 'Familia'},
    {id: 10762, name: 'Kids'},
    {id: 9648, name: 'Misterio'},
    {id: 10763, name: 'News'},
    {id: 10764, name: 'Reality'},
    {id: 10765, name: 'Sci-Fi & Fantasía'},
    {id: 10766, name: 'Soap'},
    {id: 10767, name: 'Talk'},
    {id: 10768, name: 'Guerra & Política'},
    {id: 37, name: 'Western'},
];

export const TMDB_GENRES = {
    movie: TMDB_MOVIE_GENRES,
    tv: TMDB_TV_GENRES,
} as const;

export type HispashareGenreId = string;

// TMDB movie genre ID -> HispaShare genre IDs.
export const TMDB_MOVIE_TO_HISPASHARE: Readonly<
    Record<number, readonly HispashareGenreId[]>
> = {
    28: ['1.1'], // Action
    12: ['1.3'], // Adventure
    16: ['1.2'], // Animation
    35: ['1.7'], // Comedy
    80: ['1.9'], // Crime
    99: ['3'], // Documentary belongs to the documentaries group
    18: ['1.10'], // Drama
    10751: ['1.11'], // Family
    14: ['1.12'], // Fantasy
    36: ['1.19'], // History
    27: ['1.16'], // Horror
    10402: ['1.14'], // Music -> Musical
    9648: ['1.13'], // Mystery
    10749: ['1.15'], // Romance
    878: ['1.5'], // Science fiction
    10770: [], // TV movie
    53: ['1.17'], // Thriller
    10752: ['1.4'], // War
    37: ['1.18'], // Western
};

// TMDB TV genre ID -> HispaShare genre IDs.
export const TMDB_TV_TO_HISPASHARE: Readonly<
    Record<number, readonly HispashareGenreId[]>
> = {
    10759: ['5.1', '5.3'], // Action & Adventure
    16: ['5.2'], // Animation
    35: ['5.7'], // Comedy
    80: ['5.9'], // Crime
    99: ['3'], // Documentary belongs to the documentaries group
    18: ['5.10'], // Drama
    10751: ['5.11'], // Family
    10762: ['5.11'], // Kids -> Familiar
    9648: ['5.13'], // Mystery
    10763: [], // News
    10764: ['5.22'], // Reality
    10765: ['5.5', '5.12'], // Sci-Fi & Fantasy
    10766: [], // Soap
    10767: [], // Talk
    10768: ['5.4'], // War & Politics
    37: ['5.18'], // Western
};

export const TMDB_TO_HISPASHARE = {
    movie: TMDB_MOVIE_TO_HISPASHARE,
    tv: TMDB_TV_TO_HISPASHARE,
} as const;

// HispaShare genre ID -> HispaShare description.
export const HISPASHARE_GENRES: Readonly<Record<string, string>> = {
    // Movies
    '1.1': 'Acción',
    '1.2': 'Animación',
    '1.3': 'Aventura',
    '1.4': 'Bélico',
    '1.5': 'Ciencia ficción',
    '1.6': 'Cine negro',
    '1.7': 'Comedia',
    '1.8': 'Corto',
    '1.9': 'Crimen',
    '1.10': 'Drama',
    '1.11': 'Familiar',
    '1.12': 'Fantástico',
    '1.13': 'Misterio',
    '1.14': 'Musical',
    '1.15': 'Romántico',
    '1.16': 'Terror',
    '1.17': 'Thriller',
    '1.18': 'Western',
    '1.19': 'Historia',
    '1.20': 'Deportes',
    '1.21': 'Biografía',
    '1.22': 'Intriga',
    '1.23': 'Suspense',
    '1.24': 'Religión',
    '1.25': 'Política',
    '1.26': 'Artes marciales',
    '1.27': 'Anime',
    '1.28': 'Venganza',

    // Music
    '2.1': 'Documentales',
    '2.2': 'Conciertos',

    // Documentaries
    '3.1': 'Ciencia y tecnología',
    '3.2': 'Historia',
    '3.3': 'Política',
    '3.4': 'Educativo',
    '3.5': 'Bélico',
    '3.6': 'Naturaleza',
    '3.7': 'Culturas antiguas',
    '3.8': 'Personajes',
    '3.9': 'Salud y medicina',
    '3.10': 'Religión',
    '3.12': 'Viajes',
    '3.13': 'Deportes',
    '3.14': 'Economía',
    '3.15': 'Sociedad',
    '3.16': 'Ovnis y misterios',
    '3.17': 'Arte y cultura',
    '3.18': 'Cocina',
    '3.19': 'Biografía',
    '3.20': 'Crimen',
    '3.22': 'Cine',
    '3.23': 'Terrorismo',
    '3.24': 'Redes Sociales',
    '3.25': 'Catástrofes',
    '3.26': 'Artes marciales',
    '3.27': 'Anime',

    // TV series
    '5.1': 'Acción',
    '5.2': 'Animación',
    '5.3': 'Aventura',
    '5.4': 'Bélico',
    '5.5': 'Ciencia ficción',
    '5.7': 'Comedia',
    '5.9': 'Crimen',
    '5.10': 'Drama',
    '5.11': 'Familiar',
    '5.12': 'Fantástico',
    '5.13': 'Misterio',
    '5.14': 'Musical',
    '5.15': 'Romántico',
    '5.16': 'Terror',
    '5.17': 'Thriller',
    '5.18': 'Western',
    '5.19': 'Historia',
    '5.20': 'Deportes',
    '5.22': 'Reality',
    '5.23': 'Intriga',
    '5.24': 'Suspense',
    '5.25': 'Artes marciales',
    '5.26': 'Anime',
    '5.27': 'Venganza',
};
