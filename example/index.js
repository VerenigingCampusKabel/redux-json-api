import {users} from './actions';
import store from './store';

store.dispatch(users.getAll({}));
