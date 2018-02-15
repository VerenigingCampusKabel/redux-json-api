import {createApi} from 'rdx-api';

/**
 * Define a JSON API.
 *
 * @param {object} config API configuration
 * @return {object} API definition
 */
export const createJsonApi = (config) => {
    const entries = Object.entries(config.entities);

    // Normalize entities
    const entities = entries.reduce((final, [entityName, entity]) => {
        final[entityName] = {
            name: entityName,
            urlPrefix: entity.url.startsWith('/') ? entity.url : `/${entity.url}`,
            urlPostfix: ''
        };
        return final;
    }, {});

    // Create entity type lookup map
    const typeToEntity = entries.reduce((final, [entityName, entity]) => {
        final[entity.type] = entityName;
        return final;
    }, {});

    // Normalize default entity headers
    const _defaultEntityHeaders = config.entityEndpointDefaults ? config.entityEndpointDefaults.headers || {} : {};
    let defaultEntityHeaders = null;
    if (typeof _defaultEntityHeaders === 'function') {
        defaultEntityHeaders = (...args) => {
            const headers = _defaultEntityHeaders(...args);
            headers['Accept'] = 'application/vnd.api+json';
            headers['Content-Type'] = 'application/vnd.api+json';
            return headers;
        };
    } else {
        defaultEntityHeaders = () => ({
            ..._defaultEntityHeaders,
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        });
    }

    // Create the API using redux-api
    const api = createApi({
        ...config,
        options: {
            stripTrailingSlash: true,
            bodyType: 'json',
            ...config.options
        },
        entities,
        entityEndpointDefaults: {
            ...config.entityEndpointDefaults,
            headers: defaultEntityHeaders
        },
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

    // Store relevant variables
    api.typeToEntity = typeToEntity;
    api.reducerKey = config.reducerKey;

    return api;
};
