import {createJsonApiContainer} from 'rdx-json-api';

import api from './api';
import App from './App';

export default createJsonApiContainer(App, {
    api,
    entities: [{
        name: 'authors',
        preload: true,
        query: {
            include: 'books'
        }
    }, {
        name: 'books'
    }]
});
