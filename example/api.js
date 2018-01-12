import {createJsonApi} from '../lib';

export default createJsonApi({
    name: 'EXAMPLE_API',
    url: 'https://example.danielhuisman.io/v1',
    options: {},
    defaults: {
        credentials: 'include'
    },
    entities: {
        authors: {
            type: 'authors',
            url: '/authors'
        },
        books: {
            type: 'books',
            url: '/books'
        }
    }
});
