import {createStore, compose, applyMiddleware} from 'redux';
import {createApiMiddleware} from 'rdx-api';

import api from './api';
import rootReducer from './reducers';

console.log(api);

const logger = (store) => (next) => (action) => {
    console.group(action.type);
    const result = next(action);
    const final = {};
    Object.entries(store.getState()).forEach(([key, value]) => {
        final[key] = value && value.toJS ? value.toJS() : value;
    });
    console.log(action, final);
    console.groupEnd();
    return result;
};

const middleware = compose(
    applyMiddleware(createApiMiddleware(api)),
    applyMiddleware(logger)
);

const store = createStore(
    rootReducer,
    {},
    middleware
);

export default store;
