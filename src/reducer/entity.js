import {fromJS} from 'immutable';

export const parseEntity = (options, entity) => {
    // Enforce string ID
    entity.id = entity.id.toString();

    // Remove links
    delete entity.links;
    if (entity.relationships) {
        for (const relationship of Object.keys(entity.relationships)) {
            // Remove "hidden" relationships
            if (options.removeHiddenrelationships && relationship.startsWith('_')) {
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

export const parseEntities = (api, options, currentState, data) => {
    if (Array.isArray(data)) {
        if (data.length > 0) {
            // Loop over all entities
            return data.reduce((state, entityData) => {
                // Parse the entity and put it in the entity map
                const entity = parseEntity(options, entityData);
                const type = api.typeToEntity[entity.get('type')];

                return state.setIn([type, 'entities', entity.get('id')], entity);
            }, currentState);
        }
        return currentState;
    }

    // Parse the entity and update state
    const entity = parseEntity(options, data);
    const type = api.typeToEntity[entity.get('type')];

    return currentState.setIn([type, 'entities', entity.get('id')], entity);
};
