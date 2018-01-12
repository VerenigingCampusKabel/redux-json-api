import util from 'util';
import {Map} from 'immutable';
import {API_SIGNATURE, InvalidConfigError} from 'rdx-api';

import {parseEntities} from './entity';

/**
 * Create a Redux reducer for a JSON API.
 *
 * @param {object} api API configuration
 * @param {object} options Reducer options
 * @return {function} The created Redux reducer
 */
export const createJsonApiReducer = (api, {onPayloadError}) => {
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
        console.log('reducer', util.inspect(action, true, null));
        if (action.isError) {
            console.error('error', action.error);
        }

        // Check if it's an API action and if it's an entity action
        if (action.signature !== API_SIGNATURE || !action.isEntity) {
            return state;
        }

        // Check for payload errors
        if (action.hasPayloadError) {
            if (onPayloadError) {
                onPayloadError(state, action);
            }
            return state;
        }

        switch (action.endpoint) {
            case 'getAll':
            case 'getSingle':
            case 'getRelationship': {
                const requestKey = JSON.stringify(action.requestPayload || {});
                console.log('KEY:', requestKey);

                if (requestTypes.includes(action.type)) {
                    if (action.isConsecutive) {
                        // TODO: update request information (result, pages)
                        return state;
                    }

                    return state.setIn([action.entity, 'requests', requestKey], new Map({
                        loading: true,
                        failed: false,
                        error: null
                    }));
                } else if (successTypes.includes(action.type)) {
                    let newState = state;

                    if (action.payload.data) {
                        newState = parseEntities(newState, action.payload.data);
                    }
                    if (action.payload.included) {
                        newState = parseEntities(newState, action.payload.included);
                    }

                    // TODO: add entity ids to result array from payload.data (and possibly payload.included)

                    const key = [action.entity, 'requests', requestKey];

                    if (action.isConsecutive) {
                        // TODO: update request information (result, pages)
                        return newState;
                    }

                    return newState;
                    // .setIn([...key, 'loading'], false)
                    // .setIn([...key, 'resultType'], )
                    // .setIn([...key, 'result'], null);
                } else if (failureTypes.includes(action.type)) {

                }

                return state;
            }
            case 'createSingle': {break;}
            case 'updateSingle': {break;}
            case 'updateRelationship': {break;}
            case 'deleteSingle': {break;}
            case 'deleteRelationship': {break;}
            default: {
                return state;
            }
        }
    };
};
