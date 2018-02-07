import {getRequestKey} from '../util';

export const createMapStateToProps = (api, entities, otherMapStateToProps) => {
    // Create state mapper function
    const mapStateToProps = (state, ownProps) => {
        const otherProps = otherMapStateToProps ? otherMapStateToProps(state, ownProps) : {};

        const result = {
            requests: {},
            data: {},
            ...otherProps
        };

        for (const entity of entities) {
            if (entity.type === 'single') {

            } else if (entity.type === 'many') {
                // Determine request key
                const {requestKey} = getRequestKey({
                    query: entity.query
                });

                // Get the request object
                const request = state[api.reducerKey].getIn([entity.name, 'requests', requestKey]);
                result.requests[entity.name] = request;
                result.data[entity.name] = {
                    loading: request && request.get('loading'),
                    entities: request || entity.all ? state[api.reducerKey]
                        .getIn([entity.name, 'entities'])
                        .filter((_, entityId) => entity.all || request.get('result').includes(entityId))
                        .valueSeq() : []
                };
            }
        }

        return result;
    };

    return mapStateToProps;
};
