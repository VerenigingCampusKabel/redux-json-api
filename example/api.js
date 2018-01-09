import {createJsonApi} from '../lib';

export default createJsonApi({
    name: 'EXAMPLE_API',
    url: 'https://jsonplaceholder.typicode.com',
    options: {},
    defaults: {
        credentials: 'include'
    },
    entities: {
        users: '/users',
        posts: '/posts'
    }
});
