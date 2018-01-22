import stringify from 'json-stable-stringify';

export const getRequestKey = (payload = {}) => {
    // Determine the request key by stripping the page query and stringifying the rest
    let pageQuery = {};
    const requestKey = stringify(payload, {
        replacer: (key, value) => {
            if (key === 'query' && value && value.page) {
                const {page, ...query} = value;
                pageQuery = page;
                return Object.entries(query).length > 0 ? query : undefined;
            }
            return value;
        }
    });

    return {requestKey, pageQuery};
};

export const getPageFromUrl = (url) => {
    const urlObject = new URL(url.startsWith('http') ? url : `http://example.com${url.charAt(0) === '/' ? '' : '/'}${url}`);
    return parseInt(urlObject.searchParams.get('page[number]'));
};
