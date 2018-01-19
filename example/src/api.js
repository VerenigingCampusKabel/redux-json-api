import {createJsonApi} from 'rdx-json-api';

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
    defaults: {},
    entities: {
        authors: {
            type: 'authors',
            url: '/authors'
        },
        books: {
            type: 'books',
            url: '/books'
        }
    },
    reducerKey: 'entities'
});
