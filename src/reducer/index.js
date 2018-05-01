import {fromJS, List, Map} from 'immutable';
import {API_SIGNATURE, InvalidConfigError} from 'rdx-api';

import {getRequestKey, getPageFromUrl} from '../util';
import {parseEntities} from './entity';

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

        // Determine action type
        let type = null;
        if (requestTypes.includes(action.type)) {
            type = 'request';
        } else if (successTypes.includes(action.type)) {
            type = 'success';
        } else if (failureTypes.includes(action.type)) {
            type = 'failure';
        }

        // Use the current state as base for the new state
        let newState = state;

        switch (action.endpoint) {
            case 'getAll':
            case 'getSingle':
            case 'getRelationship': {
                // Determine request key
                const {requestKey, pageQuery} = getRequestKey(action.requestPayload);
                const key = [action.entity, 'requests', requestKey];

                if (type === 'request') {
                    if (pageQuery.number > 1) {
                        // Update pages pending and loading lists
                        return newState
                            .updateIn([...key, 'pagesPending'], (list) => list.delete(list.indexOf(pageQuery.number)))
                            .updateIn([...key, 'pagesLoading'], (list) => list.push(pageQuery.number));
                    }

                    newState = newState.setIn(key, new Map({
                        loading: true,
                        failed: false,
                        error: null,
                        result: new List(),
                        pageSize: pageQuery.size || 100,
                        pageCount: action.pageLimit,
                        pagesPending: new List(),
                        pagesLoading: new List([1])
                    }));
                } else if (type === 'success') {
                    // Store returned entities
                    if (action.payload.data) {
                        newState = parseEntities(api, options, newState, action.payload.data, key);
                    }
                    if (action.payload.included) {
                        newState = parseEntities(api, options, newState, action.payload.included);
                    }

                    // Update pagination information
                    if (action.payload.links && Array.isArray(action.payload.data)) {
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
                    newState = newState.setIn([...key, 'loading'],
                        newState.getIn([...key, 'pagesPending']).size > 1 || newState.getIn([...key, 'pagesLoading']).size > 1
                    );
                } else if (type === 'failure') {
                    // TODO: handle failure (possibly add pagesFailed)
                }
                return newState;
            }
            case 'createSingle': {
                if (type === 'success') {
                    // TODO: handle success
                } else if (type === 'failure') {
                    // TODO: handle failure
                }
                return newState;
            }
            case 'updateSingle': {
                if (type === 'success') {
                    // Update entity attributes
                    const entity = fromJS(action.requestPayload);
                    const key = [action.entity, 'entities', entity.get('id')];
                    newState = newState.mergeIn([...key, 'attributes'], entity.get('attributes'));

                    // Update relationships set using an attribute
                    // if (relationships[action.entity]) {
                    //     for (const [attr, relation] of Object.entries(relationships[action.entity])) {
                    //         const value = newState.getIn([...key, 'attributes', attr]);
                    //         if (!value) {
                    //             newState = newState.deleteIn([...key, 'relationships', relation.key, 'data']);
                    //         } else {
                    //             newState = newState.setIn([...key, 'relationships', relation.key, 'data'], new Map({
                    //                 id: value,
                    //                 type: relation.type
                    //             }));
                    //         }
                    //     }
                    // }
                } else if (type === 'failure') {
                    // TODO: handle failure
                }
                return newState;
            }
            case 'updateRelationship': {
                if (type === 'success') {
                    const key = [action.entity, action.requestPayload.id, 'relationships', action.requestPayload.relationship, 'data'];

                    // Update all entities of the relationship
                    if (Array.isArray(action.requestPayload.data)) {
                        return newState.setIn(key, fromJS(action.requestPayload.data));
                    }

                    // Update the relationship
                    newState = newState.setIn([...key, 'id'], action.requestPayload.data.id);
                } else if (type === 'failure') {
                    // TODO: handle failure
                }
                return newState;
            }
            case 'deleteSingle': {
                if (type === 'success') {
                    // Delete the entity
                    newState = newState.deleteIn([action.entity, 'entities', action.requestPayload.id]);
                } else if (type === 'failure') {
                    // TODO: handle failure
                }
                return newState;
            }
            case 'deleteRelationship': {
                if (type === 'success') {
                    const key = [action.entity, 'entities', action.requestPayload.id, 'relationships', action.requestPayload.relationship, 'data'];

                    // Delete all entities of the relationship
                    if (Array.isArray(action.requestPayload.data)) {
                        const relationship = newState.getIn(key);
                        for (const entity of action.requestPayload.data) {
                            const index = relationship.findIndex((e) => e.get('id') === entity.id);
                            newState = newState.deleteIn([...key, index]);
                        }
                        return newState;
                    }

                    // Delete the relationship
                    newState = newState.deleteIn(key);
                } else if (type === 'failure') {
                    // TODO: handle failure
                }
                return newState;
            }
            default: {
                return newState;
            }
        }
    };
};
