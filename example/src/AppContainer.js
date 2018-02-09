import {createJsonApiContainer} from 'rdx-json-api';

import api from './api';
import App from './App';

export default createJsonApiContainer(App, {
    api,
    pageSize: 1,
    entities: [{
        type: 'many',
        name: 'authors',
        preload: true,
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
                preload: true
            }
        }
    }]
});
