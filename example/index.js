import {authors} from './actions';
import store from './store';

(async () => {
    await store.dispatch(authors.getAll({}));
    await store.dispatch(authors.getRelationship({
        id: '1',
        relationship: 'books'
    }));
})();
