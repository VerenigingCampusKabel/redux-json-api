import {fromJS} from 'immutable';

export const parseEntity = (options, entity) => {
    // Enforce string ID
    entity.id = entity.id.toString();

    // Remove links
    delete entity.links;
    if (entity.relationships) {
        for (const relationship of Object.keys(entity.relationships)) {
            // Remove "hidden" relationships
            if (options.removeHiddenRelationships && relationship.startsWith('_')) {
                delete entity.relationships[relationship];
            } else {
                delete entity.relationships[relationship].links;
            }
        }
    }

    // Set ID and timestamp
    entity.attributes.id = entity.id;

    return fromJS(entity);
};

export const _parseEntities = (api, options, currentState, data, key = null) => {
    if (data.length > 0) {
        // Loop over all entities
        return data.reduce((state, entityData) => {
            // Parse the entity and put it in the entity map
            const entity = parseEntity(options, entityData);
            const type = api.typeToEntity[entity.get('type')];

            let newState = state.setIn([type, 'entities', entity.get('id')], entity);
            if (key) {
                newState = newState.updateIn([...key, 'result'], (result) => result.push(entity.get('id')));
                if (!newState.getIn([...key, 'resultType'])) {
                    newState = newState.setIn([...key, 'resultType'], entity.get('type'));
                }
            }
            return newState;
        }, currentState);
    }
    return currentState;
};

export const parseEntities = (api, options, currentState, data, key = null) => {
    if (Array.isArray(data)) {
        return _parseEntities(api, options, currentState, data, key);
    }
    return _parseEntities(api, options, currentState, [data], key);
};
