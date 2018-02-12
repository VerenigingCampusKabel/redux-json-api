import {createJsonApiContainer} from 'rdx-json-api';

import api from './api';
import App from './App';

export default createJsonApiContainer(App, {
    api,
    defaultMaxRequests: 3,
    defaultPageSize: 100,
    entities: [{
        type: 'many',
        name: 'authors',
        preload: true,
        pageSize: 1,
        query: {
            include: 'books'
        }
    }, {
        type: 'many',
        name: 'books',
        all: true
    }, {
        type: 'single',
        name: 'stores',
        preload: true,
        id: () => '2',
        relationships: {
            books: {
                type: 'many',
                preload: true,
                pageSize: 5
            }
        }
    }]
});
