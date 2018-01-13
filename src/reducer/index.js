import {fromJS, List, Map} from 'immutable';
import stringify from 'json-stable-stringify';
import {API_SIGNATURE, InvalidConfigError} from 'rdx-api';

import {parseEntities} from './entity';
import {getPageFromUrl} from './util';

/**
 * Create a Redux reducer for a JSON API.
 *
 * @param {object} api API configuration
 * @param {object} options Reducer options
 * @return {function} The created Redux reducer
 */
export const createJsonApiReducer = (api, options) => {
    // Validate API configuration
    if (typeof api !== 'object') {
        throw new InvalidConfigError(`Invalid API configuration: ${api}`);
    }

    // Gather relevant information
    const {
        mergedTypes: {
            request: requestTypes,
            success: successTypes,
            failure: failureTypes
        }
    } = api;

    // Initial state
    const initialState = Object.keys(api.entities).reduce((state, entityName) => state.set(entityName, new Map({
        entities: new Map(),
        requests: new Map()
    })), new Map());

    // Return the reducer
    return (state = initialState, action) => {
        // Execute the action handler, if it's present
        if (options.onAction) {
            const newState = options.onAction(state, action);
            if (newState) {
                return newState;
            }
        }

        // Check if it's an API action and if it's an entity action
        if (action.signature !== API_SIGNATURE || !action.isEntity) {
            return state;
        }

        // Check for payload errors
        if (action.hasPayloadError) {
            if (options.onPayloadError) {
                options.onPayloadError(state, action);
            }
            return state;
        }

        switch (action.endpoint) {
            case 'getAll':
            case 'getSingle':
            case 'getRelationship': {
                // Determine the request key by stripping the page query and stringifying the rest
                let pageQuery = {};
                const requestKey = stringify(action.requestPayload || {}, {
                    replacer: (key, value) => {
                        if (key === 'query' && value.page) {
                            const {page, ...query} = value;
                            pageQuery = page;
                            return Object.entries(query).length > 0 ? query : undefined;
                        }
                        return value;
                    }
                });
                const key = [action.entity, 'requests', requestKey];

                if (requestTypes.includes(action.type)) {
                    if (action.isConsecutive) {
                        // Update pages pending and loading lists
                        return state
                            .updateIn([...key, 'pagesPending'], (list) => list.delete(list.indexOf(action.page)))
                            .updateIn([...key, 'pagesLoading'], (list) => list.push(action.page));
                    }

                    return state.setIn(key, new Map({
                        loading: true,
                        failed: false,
                        error: null,
                        result: new List(),
                        pageSize: pageQuery.size || 100,
                        pageCount: null,
                        pagesPending: new List(),
                        pagesLoading: new List([1])
                    }));
                } else if (successTypes.includes(action.type)) {
                    let newState = state;

                    // Store returned entities
                    if (action.payload.data) {
                        newState = parseEntities(api, options, newState, action.payload.data, key);
                    }
                    if (action.payload.included) {
                        newState = parseEntities(api, options, newState, action.payload.included);
                    }

                    // Update pagination information
                    if (action.payload.links) {
                        // Parse link URLs
                        const last = action.payload.links.last ? getPageFromUrl(action.payload.links.last) : 1;
                        const current = action.payload.links.next ? Math.min(Math.max(1, getPageFromUrl(action.payload.links.next) - 1), last) : last;

                        // This is the first page, so update the page count and pages pending list
                        if (!newState.getIn([...key, 'pageCount'])) {
                            newState = newState.setIn([...key, 'pageCount'], last);
                            newState = newState.setIn([...key, 'pagesPending'], new List([...Array(last - 1)].map((_, index) => index + 2)));
                        }

                        // Update pages loading list
                        newState = newState.updateIn([...key, 'pagesLoading'], (list) => list.delete(list.indexOf(current)));
                    } else {
                        // No links, so this must be the only page
                        newState = newState.setIn([...key, 'pageCount'], 1);
                        newState = newState.updateIn([...key, 'pagesLoading'], (list) => list.clear());
                    }

                    // Update loading status
                    return newState.setIn([...key, 'loading'], newState.getIn([...key, 'pagesPending']).size > 1);
                } else if (failureTypes.includes(action.type)) {
                    // TODO: handle failure (possibly add pagesFailed)
                }

                return state;
            }
            case 'createSingle': {
                return state;
            }
            case 'updateSingle': {
                let newState = state;

                // Update entity attributes
                const entity = fromJS(action.requestPayload);
                newState = newState.mergeIn([action.entity, 'entities', entity.get('id'), 'attributes'], entity.get('attributes'));

                // Update relationships set using an attribute
                // if (relationships[action.entity]) {
                //     for (const [attr, relation] of Object.entries(relationships[action.entity])) {
                //         const value = newState.getIn([action.entity, entity.get('id'), 'attributes', attr]);
                //         if (!value) {
                //             newState = newState.deleteIn([action.entity, entity.get('id'), 'relationships', relation.key, 'data']);
                //         } else {
                //             newState = newState.setIn([action.entity, entity.get('id'), 'relationships', relation.key, 'data'], new Map({
                //                 id: value,
                //                 type: relation.type
                //             }));
                //         }
                //     }
                // }

                return newState;
            }
            case 'updateRelationship': {
                return state;
            }
            case 'deleteSingle': {
                // Delete the entity
                return state.deleteIn([action.entity, 'entities', action.requestPayload.id]);
            }
            case 'deleteRelationship': {
                return state;
            }
            default: {
                return state;
            }
        }
    };
};
