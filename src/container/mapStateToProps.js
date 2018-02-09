import {getRequestKey} from '../util';

export const createMapStateToProps = (api, entities, otherMapStateToProps) => {
    // Create state mapper function
    const mapStateToProps = (state, ownProps) => {
        const otherProps = otherMapStateToProps ? otherMapStateToProps(state, ownProps) : {};

        const result = {
            requests: [],
            data: {},
            ...otherProps
        };

        const requests = {};

        for (const entity of entities) {
            if (entity.type === 'single') {
                // Determine request key
                const {requestKey} = getRequestKey({
                    id: entity.id
                });
                requests[entity.name] = [requestKey];

                if (entity.relationships) {
                    for (const [relationshipName, relationship] of Object.entries(entity.relationships)) {
                        // Determine request key
                        const {requestKey} = getRequestKey({
                            id: entity.id,
                            relationship: relationshipName,
                            query: relationship.query
                        });
                        requests[entity.name].push(requestKey);
                    }
                }
            } else if (entity.type === 'many') {
                // Determine request key
                const {requestKey} = getRequestKey({
                    query: entity.query
                });
                requests[entity.name] = [requestKey];
            }
        }

        for (const [entityName, requestKey] of Object.entries(requests)) {
            const entity = {
                name: entityName,
                all: false
            };

            // Get the request object
            const request = state[api.reducerKey].getIn([entity.name, 'requests', requestKey]);
            result.requests.push(request);

            // TODO: merge entity lists?
            result.data[entity.name] = {
                loading: request && request.get('loading'),
                entities: request || entity.all ? state[api.reducerKey]
                    .getIn([entity.name, 'entities'])
                    .filter((_, entityId) => entity.all || request.get('result').includes(entityId))
                    .valueSeq() : []
            };
        }

        return result;
    };

    return mapStateToProps;
};
