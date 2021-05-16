// @ts-check
const fetch = require('isomorphic-unfetch');
const cheerio = require('cheerio');
const {zipObject} = require('lodash');

const fetchOptions = {
    headers: {cookie: 'beta-control=tmd=in;'},
};

/**
 * @param {string} url
 */
const cleanImageUrl = (url) => url.replace(/\._V1_[^.]+/, '');

/**
 * @param {string} str
 */
const removeParens = (str) =>
    str.startsWith('(') && str.endsWith(')') ? str.slice(1, -1) : str;

/**
 * @param {string} id for example: "tt7221388"
 */
const getMain = async (id) => {
    const result = await fetch(
        `https://www.imdb.com/title/${id}`,
        fetchOptions
    );
    const html = await result.text();
    const $ = cheerio.load(html);
    const title = $('[data-testid="hero-title-block__title"]').text();
    const genres = $('[data-testid="storyline-genres"] a')
        .toArray()
        .map((e) => $(e).text());
    const plot = $('[data-testid="plot-m"]').text();
    const storyline = $('[data-testid="storyline-plot-summary"]')
        .text()
        // remove text like: " — Kenneth Chisholm (kchishol@rogers.com)" from the end
        .replace(/\s+—.*$/, '');
    const score =
        +$('[data-testid="hero-title-block__aggregate-rating__score"] span')
            .first()
            .text() || null;

    // countries
    const countries = $('[data-testid="title-details-origin"] li')
        .toArray()
        .map((e) => $(e).text().trim());
    return {title, genres, plot, storyline, score, countries};
};

/**
 * @param {string} id for example: "tt7221388"
 */
const getImages = async (id) => {
    const result = await fetch(
        `https://www.imdb.com/title/${id}/mediaindex`,
        fetchOptions
    );
    const html = await result.text();
    const $ = cheerio.load(html);
    const poster = $('img.poster').attr('src');
    return {poster: cleanImageUrl(poster)};
};

/**
 * @param {string} id for example: "tt7221388"
 */
const getKeywords = async (id) => {
    const result = await fetch(
        `https://www.imdb.com/title/${id}/keywords`,
        fetchOptions
    );
    const html = await result.text();
    const $ = cheerio.load(html);
    const keywords = $('table.dataTable td div.sodatext a')
        .toArray()
        .map((e) => $(e).text());
    return {keywords};
};

/**
 * @param {string} id for example: "tt7221388"
 */
const getReleaseInfo = async (id) => {
    const result = await fetch(
        `https://www.imdb.com/title/${id}/releaseinfo`,
        fetchOptions
    );
    const html = await result.text();
    const $ = cheerio.load(html);
    const releaseDates = $('table.release-dates-table-test-only tr')
        .toArray()
        .map((e) =>
            zipObject(
                ['region', 'date', 'place'],
                $(e)
                    .find('td')
                    .toArray()
                    .map((e, index) => {
                        const s = $(e).text().trim();
                        if (index === 1) {
                            return new Date(s);
                        } else if (index === 2) {
                            return removeParens(s);
                        }
                        return s;
                    })
            )
        );
    const akas = $('table.akas-table-test-only tr')
        .toArray()
        .map((e) =>
            zipObject(
                ['region', 'title'],
                $(e)
                    .find('td')
                    .toArray()
                    .map((e) => $(e).text().trim())
            )
        );
    return {releaseDates, akas};
};

/**
 * @param {string} id for example: "tt7221388"
 */
const getTechnical = async (id) => {
    const result = await fetch(
        `https://www.imdb.com/title/${id}/technical`,
        fetchOptions
    );
    const html = await result.text();
    const $ = cheerio.load(html);
    const technical = {runtime: 0};
    $('table.dataTable tr')
        .toArray()
        .map((e) =>
            $(e)
                .find('td')
                .toArray()
                .map((e) => $(e).text().trim())
        )
        .forEach(([key, value]) => {
            const RE_MINUTES_FULL = /^(\d+) min$/;
            const RE_MINUTES_PARENS = /\((\d+) min\)/;
            if (key.toLowerCase() === 'runtime') {
                if (value.match(RE_MINUTES_FULL)) {
                    technical.runtime = +value.match(RE_MINUTES_FULL)[1];
                } else if (value.match(RE_MINUTES_PARENS)) {
                    technical.runtime = +value.match(RE_MINUTES_PARENS)[1];
                }
            }
        });
    return technical;
};

const getCredits = async (id) => {
    const result = await fetch(
        `https://www.imdb.com/title/${id}/fullcredits`,
        fetchOptions
    );
    const html = await result.text();
    const $ = cheerio.load(html);
    const directors = $('h4#director ~ table')
        .first()
        .find('tr')
        .toArray()
        .map((e) => $(e).find('td.name').text().trim());

    const actors = $('table.cast_list')
        .find('td.primary_photo a img')
        .toArray()
        .map((e) => $(e).attr('title').trim());

    return {directors, actors};
};

/**
 * @param {string} id for example: "tt7221388"
 */
const getTitle = async (id) => {
    const parts = await Promise.all([
        getMain(id),
        getImages(id),
        getKeywords(id),
        getReleaseInfo(id),
        getTechnical(id),
        getCredits(id),
    ]);
    return Object.assign({}, ...parts);
};

module.exports = {getTitle};

// getTitle('tt7126948').then(console.log);
