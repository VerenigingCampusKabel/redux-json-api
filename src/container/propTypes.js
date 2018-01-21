import PropTypes from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

export const propTypes = {
    data: PropTypes.objectOf(PropTypes.shape({
        // TODO: update these
        // loadingSingle: PropTypes.bool.isRequired,
        // loading: PropTypes.bool.isRequired,
        // pagination: ImmutablePropTypes.map.isRequired,
        // entities: ImmutablePropTypes.iterable,
        // entitiesMap: ImmutablePropTypes.map
    })),
    actions: PropTypes.objectOf(PropTypes.shape({
        getEntity: PropTypes.func.isRequired,
        getEntities: PropTypes.func.isRequired,
        createEntity: PropTypes.func.isRequired,
        updateEntity: PropTypes.func.isRequired,
        deleteEntity: PropTypes.func.isRequired
    }))
};
