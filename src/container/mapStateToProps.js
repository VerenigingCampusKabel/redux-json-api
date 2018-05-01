import {List} from 'immutable';
import {getRequestKey} from '../util';

export const createMapStateToProps = (api, entities, otherMapStateToProps, {defaultPageSize, defaultPageLimit, defaultMaxRequests}) => {
    // Create state mapper function
    const mapStateToProps = (state, ownProps) => {
        const otherProps = otherMapStateToProps ? otherMapStateToProps(state, ownProps) : {};

        const result = {
            requests: {},
            requestData: {},
            data: {},
            ...otherProps
        };

        const addRequest = (
            entityName, action, data, pagination = false, preload = false,
            pageSize = defaultPageSize, pageLimit = defaultPageLimit, maxRequests = defaultMaxRequests
        ) => {
            const {requestKey} = getRequestKey(data);

            if (!result.requests[entityName]) {
                result.requests[entityName] = [];
                result.requestData[entityName] = [];
            }
            result.requests[entityName].push({
                action,
                pagination,
                preload,
                maxRequests,
                pageSize: pagination ? pageSize : 1,
                pageLimit: pageLimit,
                data,
                requestKey
            });

            const request = state[api.reducerKey].getIn([entityName, 'requests', requestKey]);
            result.requestData[entityName][requestKey] = request;
            return request;
        };

        for (const entity of entities) {
            if (entity.type === 'single') {
                const id = typeof entity.id === 'function' ? entity.id(ownProps) : entity.id;

                const request = addRequest(entity.name, 'getEntity', {
                    id
                }, false, entity.preload, undefined, undefined, entity.maxRequests);

                result.data[entity.name] = {
                    loading: request && request.get('loading'),
                    entity: request && request.get('result').size >= 1 ? state[api.reducerKey]
                        .getIn([entity.name, 'entities', request.getIn(['result', 0])]) : null
                };

                if (entity.relationships) {
                    result.data[entity.name].relationships = {};

                    for (const [relationshipName, relationship] of Object.entries(entity.relationships)) {
                        const request = addRequest(entity.name, 'getRelationship', {
                            id,
                            relationship: relationshipName,
                            query: relationship.query
                        }, relationship.type === 'many', relationship.preload, relationship.pageSize, relationship.pageLimit, relationship.maxRequests);

                        const data = {
                            loading: request && request.get('loading'),
                        };

                        if (relationship.type === 'single') {
                            data.entity = request && request.get('result').size >= 1 ? state[api.reducerKey]
                                .getIn([api.typeToEntity[request.get('resultType')], 'entities', request.getIn(['result', 0])]) : null;
                        } else {
                            data.entities = request ? (request.get('result').size >= 1 ? state[api.reducerKey]
                                .getIn([api.typeToEntity[request.get('resultType')], 'entities'])
                                .filter((_, entityId) => request.get('result').includes(entityId))
                                .valueSeq() : new List()) : null;
                        }

                        result.data[entity.name].relationships[relationshipName] = data;
                    }
                }
            } else if (entity.type === 'many') {
                const request = addRequest(entity.name, 'getEntities', {
                    query: entity.query
                }, true, entity.preload, entity.pageSize, entity.pageLimit, entity.maxRequests);

                result.data[entity.name] = {
                    loading: request && request.get('loading'),
                    entities: request || entity.all ? state[api.reducerKey]
                        .getIn([entity.name, 'entities'])
                        .filter((_, entityId) => entity.all || request.get('result').includes(entityId))
                        .valueSeq() : null
                };
            }
        }

        return result;
    };

    return mapStateToProps;
};
