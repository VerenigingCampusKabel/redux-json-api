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
            const {requests, requestData, actions} = props;

            entities.forEach((entity) => {
                const a = actions[entity.name];

                for (const request of requests[entity.name]) {
                    const d = requestData[request.requestKey];

                    if (request.preload) {
                        if (!d || (d.get('pagesPending').size > 0 && d.get('pagesLoading').size < maxRequests)) {
                            const page = d ? d.getIn(['pagesPending', 0]) : 1;

                            a[request.action](request.pagination ? {
                                ...request.data,
                                query: {
                                    page: {
                                        number: page,
                                        size: request.pageSize
                                    },
                                    ...request.data.query
                                },
                            } : {
                                ...request.data
                            });
                        }
                    }
                }
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
