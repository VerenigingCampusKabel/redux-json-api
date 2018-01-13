import {authors} from './actions';
import store from './store';

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
