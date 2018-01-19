import 'babel-polyfill';

import debug from 'debug';
import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';
import {authors} from './actions';
import store from './store';

// Disable sockjs debug information by overriding the enable debug namespaces
debug.enable('');

// Render the root component
ReactDOM.render(<Root />, document.getElementById('root'));

(async () => {
    await store.dispatch(authors.getAll({
        query: {
            page: {
                number: 1,
                size: 100
            }
        }
    }));
    await store.dispatch(authors.getRelationship({
        id: '1',
        relationship: 'books'
    }));
})();
