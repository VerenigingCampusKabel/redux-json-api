import {createApi} from 'rdx-api';

/**
 * Define an API
 *
 * @param {object} config API configuration
 * @return {object} API definition
 */
export const createJsonApi = (config) => {
    // Normalize entities
    const entities = Object.entries(config.entities).reduce((final, [entityName, entityUrl]) => {
        final[entityName] = {
            name: entityName,
            urlPrefix: entityUrl.startsWith('/') ? entityUrl : `/${entityUrl}`,
            urlPostfix: ''
        };
        return final;
    }, {});

    // Normalize default headers
    let defaultHeaders = config.defaults ? config.defaults.headers || {} : {};
    if (typeof defaultHeaders === 'function') {
        defaultHeaders = (...args) => {
            const headers = defaultHeaders(...args);
            headers['Accept'] = 'application/vnd.api+json';
            headers['Content-Type'] = 'application/vnd.api+json';
            return headers;
        };
    } else {
        defaultHeaders = () => ({
            ...defaultHeaders,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        });
    }

    // Create the API using redux-api
    return createApi({
        ...config,
        options: {
            stripTrailingSlash: true,
            bodyType: 'json',
            ...config.options
        },
        defaults: {
            ...config.defaults,
            headers: defaultHeaders
        },
        entities,
        entityEndpoints: {
            getAll: {
                url: '/',
                method: 'GET',
                query: ({query}) => query
            },
            createSingle: {
                url: '/',
                method: 'POST',
                body: (payload) => ({data: payload})
            },
            getSingle: {
                url: (payload) => `/${payload.id}`,
                method: 'GET',
                query: ({query}) => query
            },
            getRelationship: {
                url: (payload) => `/${payload.id}/${payload.relationship}`,
                method: 'GET',
                query: ({query}) => query
            },
            updateSingle: {
                url: (payload) => `/${payload.id}`,
                method: 'PATCH',
                body: (payload) => ({data: payload})
            },
            updateRelationship: {
                url: (payload) => `/${payload.id}/relationships/${payload.relationship}`,
                method: 'PATCH',
                body: ({data}) => ({data})
            },
            deleteSingle: {
                url: (payload) => `/${payload.id}`,
                method: 'DELETE'
            },
            deleteRelationship: {
                url: (payload) => `/${payload.id}/relationships/${payload.relationship}`,
                method: 'DELETE',
                body: ({data}) => ({data})
            },
            ...config.entityEndpoints
        }
    });
};
