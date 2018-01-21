import {getRequestKey} from '../util';

export const createMapStateToProps = (api, entities, otherMapStateToProps) => {
    // Create state mapper function
    const mapStateToProps = (state, ownProps) => {
        const otherProps = otherMapStateToProps ? otherMapStateToProps(state, ownProps) : {};

        return {
            data: entities.reduce((final, entity) => {
                // Determine request key
                const {requestKey} = getRequestKey({
                    query: entity.query
                });

                const request = state[api.reducerKey].getIn([entity.name, 'requests', requestKey]);
                // final[entity.name] = request ? request.toJS() : null;
                final[entity.name] = request;
                return final;
            }, {}),
            ...otherProps
        };
    };

    return mapStateToProps;
};
