import {createJsonApiContainer} from 'rdx-json-api';

import api from './api';
import App from './App';

export default createJsonApiContainer(App, {
    api,
    entities: [{
        type: 'many',
        name: 'authors',
        pageSize: 1,
        preload: true,
        query: {
            include: 'books'
        }
    }, {
        type: 'many',
        name: 'books',
        pageSize: 10,
        all: true
    }, {
        type: 'single',
        name: 'stores',
        preload: true,
        id: () => '2',
        relationships: {
            books: {
                type: 'many',
                pageSize: 5,
                preload: true
            }
        }
    }]
});
