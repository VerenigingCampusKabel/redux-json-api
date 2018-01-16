export const createMapStateToProps = (api, entities, otherMapStateToProps) => {
    // Create state mapper function
    const mapStateToProps = (state, ownProps) => {
        const otherProps = otherMapStateToProps ? otherMapStateToProps(state, ownProps) : {};

        return {
            data: entities.reduce((final, entity) => {
                // TODO: request key and map result to actual entity map/list
                const request = state[api.reducerKey].getIn([entity.name, 'requests', 'TODO-REQUEST-KEY']);
                final[entity.name] = request;
                return final;
            }),
            ...otherProps
        };
    };

    return mapStateToProps;
};
