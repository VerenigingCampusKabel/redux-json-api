import util from 'util';

import {createStore, applyMiddleware} from 'redux';
import {createApiMiddleware} from 'rdx-api';

import api from './api';
import rootReducer from './reducers';

console.log(util.inspect(api, false, null));
console.log();

const logger = (store) => (next) => (action) => {
    console.log(action.type);
    const result = next(action);
    const final = {};
    Object.entries(store.getState()).forEach(([key, value]) => {
        final[key] = value && value.toJS ? value.toJS() : value;
    });
    console.log(action);
    console.log(util.inspect(final, false, null));
    console.log();
    return result;
};

const middleware = applyMiddleware(
    createApiMiddleware(api),
    logger
);

const store = createStore(
    rootReducer,
    {},
    middleware
);

export default store;
