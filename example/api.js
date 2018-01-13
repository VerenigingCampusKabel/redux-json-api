import {createJsonApi} from '../lib';

export default createJsonApi({
    name: 'EXAMPLE_API',
    url: 'https://example.danielhuisman.io/v1',
    options: {
        camelize: {
            response: true
        },
        decamelize: {
            query: true,
            body: true
        }
    },
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
