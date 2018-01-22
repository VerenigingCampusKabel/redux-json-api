export const createMapDispatchToProps = (api, entities, otherMapDispatchToProps) => {
    // Create dispatch mapper function
    const mapDispatchToProps = (dispatch, ownProps) => {
        const otherProps = otherMapDispatchToProps ? otherMapDispatchToProps(dispatch, ownProps) : {};

        return {
            actions: entities.reduce((final, entity) => {
                // Look up entity actions
                console.log(api.actions);
                const actions = api.actions.entities[entity.name];

                final[entity.name] = {
                    getEntity: (...args) => dispatch(actions.getSingle(...args)),
                    getEntities: (...args) => dispatch(actions.getAll(...args)),
                    createEntity: (...args) => dispatch(actions.createSingle(...args)),
                    updateEntity: (...args) => dispatch(actions.updateSingle(...args)),
                    updateRelationship: (...args) => dispatch(actions.updateRelationship(...args)),
                    deleteEntity: (...args) => dispatch(actions.deleteSingle(...args)),
                    deleteRelationship: (...args) => dispatch(actions.deleteRelationship(...args))
                    // clearEntities: () => dispatch(clearEntities(entity.name))
                };
                return final;
            }, {}),
            ...otherProps
        };
    };

    return mapDispatchToProps;
};
