import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';
import {authors} from './actions';
import store from './store';

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
