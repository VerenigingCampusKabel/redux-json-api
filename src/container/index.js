import {Component, createElement} from 'react';
import {connect} from 'react-redux';
import {InvalidConfigError} from 'rdx-api';

import {propTypes} from './propTypes';
import {createMapStateToProps} from './mapStateToProps';
import {createMapDispatchToProps} from './mapDispatchToProps';

export const createJsonApiContainer = (WrappedComponent, {
    api,
    entities,
    maxRequests = 3,
    pageSize = 100,
    mapStateToProps: otherMapStateToProps,
    mapDispatchToProps: otherMapDispatchToProps
}) => {
    // Check if all required arguments were provided
    if (typeof WrappedComponent !== 'function') {
        return new InvalidConfigError('Invalid component');
    }
    if (!api) {
        throw new Error('Missing API configuration');
    }
    if (!entities) {
        throw new Error('Missing entity configuration');
    }

    // Create state and dispatch mappers
    const mapStateToProps = createMapStateToProps(api, entities, otherMapStateToProps);
    const mapDispatchToProps = createMapDispatchToProps(api, entities, otherMapDispatchToProps);

    // Create the container
    class APIContainer extends Component {
        static propTypes = propTypes

        fetchEntities(props) {
            const {data, actions} = props;

            entities.forEach((entity) => {
                const d = data[entity.name];
                const {getEntities} = actions[entity.name];

                console.log(d, data, actions);

                if (entity.preload) {
                    if (d) {
                        console.log(d.get('loading'), d.get('pagesPending').size, d.get('pagesLoading').size);
                    }
                    if (!d || (d.get('loading') && d.get('pagesPending').size > 0 && d.get('pagesLoading').size < maxRequests)) {
                        console.log('fetch');
                        if (!window.unitOnce) {
                            window.unitOnce = false;

                            getEntities({
                                query: {
                                    page: {
                                        number: d ? d.getIn(['pagesPending', 0]) : 1,
                                        size: pageSize
                                    },
                                    ...entity.query
                                }
                            });
                        }
                    }
                }

                // if (entity.preloadId) {
                //     const preloadId = entity.preloadId(props);
                //     if (preloadId && !loadingSingle && !entitiesMap.get(preloadId)) {
                //         getEntity({
                //             id: preloadId
                //         });
                //     }
                // }
            });
        }

        componentWillMount() {
            this.fetchEntities(this.props);
        }

        componentWillReceiveProps(nextProps) {
            this.fetchEntities(nextProps);
        }

        render() {
            return createElement(WrappedComponent, this.props);
        }
    }

    // Determine the name of the wrapped component
    const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    APIContainer.displayName = `APIContainer(${name})`;

    // Keep a reference to the wrapped component
    APIContainer.WrappedComponent = WrappedComponent;

    // Connect the container to Redux
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(APIContainer);
};
